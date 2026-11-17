"""
The CSRF check in front of every request that changes something.

The token has to come back in the X-CSRFToken header. Every client here also
sends the csrf_token cookie, as a browser would on a cross-site request, so a
request refused for a missing header shows the cookie alone is not enough.
"""

import re
import time

import pytest
from itsdangerous import TimestampSigner

from conftest import ApiClient, flask_app, make_album, make_playlist, make_song
from app.models import Album, Like, Playlist, PlaylistSong, Song, db

# The routes that take no form. The check used to live in the forms, so these
# went unchecked
ROUTES = [
    ('POST', '/api/auth/logout'),
    ('POST', '/api/songs/{song}/add-like'),
    ('DELETE', '/api/songs/{liked_song}/remove-like'),
    ('DELETE', '/api/songs/{song}/delete'),
    ('DELETE', '/api/albums/{album}/delete'),
    ('POST', '/api/playlists/{playlist}/playlist-songs/{song}/new'),
    ('DELETE', '/api/playlists/{playlist}/playlist-songs/{playlist_song}/delete'),
    ('DELETE', '/api/playlists/{playlist}/delete'),
]
IDS = [f'{method} {url}' for method, url in ROUTES]


@pytest.fixture
def alices_things(alice):
    """Alice's album with two songs, one of them liked and on her playlist."""
    album = make_album(alice)
    song = make_song(album)
    liked_song = make_song(album, name='Liked', track_number=2)
    db.session.add(Like(user=alice, song=liked_song))
    playlist = make_playlist(alice, songs=[liked_song])
    return {
        'album': album.id,
        'song': song.id,
        'liked_song': liked_song.id,
        'playlist': playlist.id,
        'playlist_song': playlist.playlist_songs[0].id,
    }


def state(api):
    """Everything the routes above can change."""
    db.session.expire_all()
    return {
        'logged in': 'id' in api.get('/api/auth/').get_json(),
        'albums': Album.query.count(),
        'songs': Song.query.count(),
        'likes': Like.query.count(),
        'playlists': Playlist.query.count(),
        'playlist songs': PlaylistSong.query.count(),
    }


@pytest.fixture(params=['missing', 'forged', "another session's"])
def wrong_token(request, app):
    """An X-CSRFToken header that must not get through, and its error."""
    if request.param == 'missing':
        return {}, 'The CSRF token is missing.'
    if request.param == 'forged':
        return {'X-CSRFToken': 'forged'}, 'The CSRF token is invalid.'
    # Signed by us, but for someone else's session
    return {'X-CSRFToken': ApiClient(app).csrf_token()}, 'The CSRF tokens do not match.'


@pytest.mark.parametrize('method, url', ROUTES, ids=IDS)
def test_with_the_token_the_route_runs(as_alice, alices_things, method, url):
    before = state(as_alice)

    response = as_alice.send(method, url.format(**alices_things))

    assert response.status_code == 200, response.get_json()
    assert state(as_alice) != before


@pytest.mark.parametrize('method, url', ROUTES, ids=IDS)
def test_without_the_token_the_route_is_refused(
    as_alice, alices_things, wrong_token, s3, method, url
):
    headers, message = wrong_token
    before = state(as_alice)

    response = as_alice.send(method, url.format(**alices_things), csrf=False, headers=headers)

    assert response.status_code == 400
    assert response.get_json() == {'errors': {'csrf_token': message}}
    assert state(as_alice) == before
    assert s3.removed == []


# Every route that takes one of these methods, form or not, including any
# added after this was written
CHANGING = sorted(
    (method, rule.rule)
    for rule in flask_app.url_map.iter_rules()
    for method in rule.methods & {'POST', 'PUT', 'PATCH', 'DELETE'}
)


@pytest.mark.parametrize('method, rule', CHANGING, ids=[f'{m} {r}' for m, r in CHANGING])
def test_every_route_that_changes_something_checks_the_token(as_alice, alices_things, method, rule):
    # The token is checked before the route runs, so the ids need not belong
    # to anything; with Alice's things at 1, most of them do
    url = re.sub(r'<(?:\w+:)?\w+>', '1', rule)
    before = state(as_alice)

    response = as_alice.send(method, url, csrf=False)

    # Login and signup report any failed validation as a 401
    assert response.status_code == (401 if url in ('/api/auth/login', '/api/auth/signup') else 400)
    assert response.get_json() == {'errors': {'csrf_token': 'The CSRF token is missing.'}}
    assert state(as_alice) == before


def test_signup_without_the_token_is_a_401(client):
    response = client.post(
        '/api/auth/signup',
        data={'username': 'Newbie', 'email': 'newbie@example.com', 'password': 'secret1'},
        csrf=False,
    )

    assert response.status_code == 401
    assert response.get_json() == {'errors': {'csrf_token': 'The CSRF token is missing.'}}
    assert 'email' not in client.get('/api/auth/').get_json()


def test_the_token_lasts_as_long_as_the_session(as_alice, monkeypatch):
    # A tab left open for two hours: its cookie still holds the token from the
    # last response it got
    later = int(time.time()) + 2 * 60 * 60
    monkeypatch.setattr(TimestampSigner, 'get_timestamp', lambda self: later)

    response = as_alice.post('/api/auth/logout')

    assert response.status_code == 200, response.get_json()
