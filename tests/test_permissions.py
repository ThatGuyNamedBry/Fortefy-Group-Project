"""
Every route that needs a login, checked three ways: anonymous, as someone
who doesn't own the thing, and with an id that doesn't exist.
"""

import pytest

from conftest import make_album, make_playlist, make_song, wav_file
from app.models import Album, Playlist, PlaylistSong, Song, db

MISSING = 999999


def album_form():
    return {'name': 'Renamed', 'artist': 'Someone', 'year': 2021, 'genre': 'Jazz', 'art': ''}


def song_upload():
    return {'name': 'New Song', 'track_number': 2, 'song': wav_file()}


def song_form():
    return {'name': 'Renamed', 'track_number': 3}


def playlist_form():
    return {'title': 'Renamed', 'art': '', 'description': ''}


# method, URL, form data, and whether the route belongs to a resource someone
# owns (so another user gets a 403)
ROUTES = [
    ('GET', '/api/users/', None, False),
    ('GET', '/api/users/{user}', None, False),
    ('GET', '/api/albums/current', None, False),
    ('POST', '/api/albums/newAlbum', album_form, False),
    ('PUT', '/api/albums/edit/{album}', album_form, True),
    ('DELETE', '/api/albums/{album}/delete', None, True),
    ('POST', '/api/albums/{album}/song', song_upload, True),
    ('GET', '/api/songs/current', None, False),
    ('GET', '/api/songs/liked', None, False),
    ('PUT', '/api/songs/{song}', song_form, True),
    ('DELETE', '/api/songs/{song}/delete', None, True),
    ('POST', '/api/songs/{song}/add-like', None, False),
    ('DELETE', '/api/songs/{song}/remove-like', None, False),
    ('GET', '/api/playlists/current', None, False),
    ('POST', '/api/playlists/new', playlist_form, False),
    ('PUT', '/api/playlists/{playlist}/edit', playlist_form, True),
    ('DELETE', '/api/playlists/{playlist}/delete', None, True),
    ('POST', '/api/playlists/{playlist}/playlist-songs/{song}/new', None, True),
    ('DELETE', '/api/playlists/{playlist}/playlist-songs/{playlist_song}/delete', None, True),
]


@pytest.fixture
def alices_things(alice):
    """Alice's album, song and playlist, with the song on the playlist."""
    album = make_album(alice)
    song = make_song(album)
    playlist = make_playlist(alice, songs=[song])
    return {
        'user': alice.id,
        'album': album.id,
        'song': song.id,
        'playlist': playlist.id,
        'playlist_song': playlist.playlist_songs[0].id,
    }


def request(api, method, url, data):
    return api.send(method, url, data=data() if data else None, csrf=method != 'GET')


def counts():
    db.session.expire_all()
    return {
        'albums': Album.query.count(),
        'songs': Song.query.count(),
        'playlists': Playlist.query.count(),
        'playlist_songs': PlaylistSong.query.count(),
        'names': sorted(a.name for a in Album.query) + sorted(s.name for s in Song.query),
    }


@pytest.mark.parametrize(
    'method, url, data, owned', ROUTES, ids=[f'{m} {u}' for m, u, *_ in ROUTES]
)
def test_anonymous_gets_401(client, alices_things, method, url, data, owned):
    before = counts()

    response = request(client, method, url.format(**alices_things), data)

    assert response.status_code == 401
    assert response.get_json() == {'errors': ['Unauthorized']}
    assert counts() == before


OWNED = [route for route in ROUTES if route[3]]


@pytest.mark.parametrize('method, url, data, owned', OWNED, ids=[f'{m} {u}' for m, u, *_ in OWNED])
def test_someone_elses_resource_gets_403(as_bob, alices_things, s3, method, url, data, owned):
    before = counts()

    response = request(as_bob, method, url.format(**alices_things), data)

    assert response.status_code == 403
    assert 'does not belong to user' in response.get_json()['errors']
    assert counts() == before
    assert s3.uploaded == [] and s3.removed == []


WITH_IDS = [route for route in ROUTES if '{' in route[1]]


@pytest.mark.parametrize(
    'method, url, data, owned', WITH_IDS, ids=[f'{m} {u}' for m, u, *_ in WITH_IDS]
)
def test_missing_id_gets_404(as_alice, alices_things, method, url, data, owned):
    before = counts()
    # Every id in the URL missing at once; the first one checked is the 404
    missing = {key: MISSING for key in alices_things}

    response = request(as_alice, method, url.format(**missing), data)

    assert response.status_code == 404
    assert 'errors' in response.get_json()
    assert counts() == before


def test_a_playlist_entry_cannot_be_removed_through_another_playlist(as_alice, alice):
    song = make_song(make_album(alice))
    first = make_playlist(alice, songs=[song])
    second = make_playlist(alice, songs=[song])
    entry_of_second = second.playlist_songs[0].id

    response = as_alice.delete(f'/api/playlists/{first.id}/playlist-songs/{entry_of_second}/delete')

    assert response.status_code == 404
    assert db.session.get(PlaylistSong, entry_of_second) is not None
