import pytest

from conftest import make_album, make_playlist, make_song
from app.models import Playlist, PlaylistSong, db


def test_create_a_playlist(as_alice, alice):
    response = as_alice.post(
        '/api/playlists/new', data={'title': 'Road trip', 'art': '', 'description': 'Loud'}
    )

    assert response.status_code == 200
    playlist = response.get_json()
    assert playlist['title'] == 'Road trip'
    assert playlist['art'] is None
    assert playlist['user'] == {'id': alice.id, 'username': 'Alice'}
    assert playlist['playlist_songs'] == []


@pytest.mark.parametrize(
    'fields, field',
    [
        ({'title': ''}, 'title'),
        ({'title': 'x' * 61}, 'title'),
        ({'description': 'x' * 255}, 'description'),
        ({'art': 'https://example.com/cover'}, 'art'),
    ],
)
def test_playlist_validation(as_alice, fields, field):
    data = {'title': 'Road trip', 'art': '', 'description': '', **fields}

    response = as_alice.post('/api/playlists/new', data=data)

    assert response.status_code == 400
    assert field in response.get_json()['errors']
    assert Playlist.query.count() == 0


def test_a_song_can_be_on_a_playlist_twice(as_alice, alice):
    song = make_song(make_album(alice))
    playlist = make_playlist(alice)
    url = f'/api/playlists/{playlist.id}/playlist-songs/{song.id}/new'

    as_alice.post(url)
    response = as_alice.post(url)

    entries = response.get_json()['playlist_songs']
    assert [entry['song_id'] for entry in entries] == [song.id, song.id]


def test_removing_one_copy_keeps_the_other(as_alice, alice):
    song = make_song(make_album(alice))
    playlist = make_playlist(alice, songs=[song, song])
    first, second = [entry.id for entry in playlist.playlist_songs]

    response = as_alice.delete(f'/api/playlists/{playlist.id}/playlist-songs/{second}/delete')

    assert response.status_code == 200
    assert [entry['id'] for entry in response.get_json()['playlist_songs']] == [first]


def test_adding_a_missing_song(as_alice, alice):
    playlist = make_playlist(alice)

    response = as_alice.post(f'/api/playlists/{playlist.id}/playlist-songs/999999/new')

    assert response.status_code == 404
    assert PlaylistSong.query.count() == 0


def test_edit_a_playlist(as_alice, alice):
    playlist = make_playlist(alice)

    response = as_alice.put(
        f'/api/playlists/{playlist.id}/edit',
        data={'title': 'Renamed', 'art': 'https://example.com/p.png', 'description': 'New'},
    )

    assert response.status_code == 200
    assert response.get_json()['art'] == 'https://example.com/p.png'
    assert db.session.get(Playlist, playlist.id).title == 'Renamed'


def test_delete_a_playlist_and_its_entries(as_alice, alice):
    song = make_song(make_album(alice))
    playlist = make_playlist(alice, songs=[song])

    response = as_alice.delete(f'/api/playlists/{playlist.id}/delete')

    assert response.status_code == 200
    assert Playlist.query.count() == 0
    assert PlaylistSong.query.count() == 0


def test_playlist_lists(client, as_alice, alice, bob):
    make_playlist(alice, title='Mine')
    make_playlist(bob, title='Theirs')

    everyone = client.get('/api/playlists').get_json()
    mine = as_alice.get('/api/playlists/current').get_json()

    assert sorted(p['title'] for p in everyone) == ['Mine', 'Theirs']
    assert [p['title'] for p in mine] == ['Mine']
    assert client.get('/api/playlists/999999').status_code == 404
