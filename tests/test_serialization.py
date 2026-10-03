"""
The shapes the frontend relies on, and the guarantee that nothing public ever
carries an email address or a password hash.
"""

from conftest import make_album, make_playlist, make_song
from app.models import Like, db

USER_KEYS = {'id', 'username'}
ALBUM_KEYS = {'id', 'name', 'art', 'artist', 'year', 'genre', 'user', 'songs', 'created_at', 'updated_at'}
SONG_KEYS = {
    'id', 'name', 'user_id', 'album_id', 'duration', 'user', 'likes', 'song_url', 'track_number',
    'artist', 'album_name', 'album_art', 'created_at', 'updated_at',
}
PLAYLIST_KEYS = {
    'id', 'user_id', 'title', 'art', 'description', 'user', 'playlist_songs', 'created_at',
    'updated_at',
}
PLAYLIST_SONG_KEYS = {'id', 'song_id', 'playlist_id', 'song', 'created_at', 'updated_at'}
PRIVATE_KEYS = {'email', 'hashed_password', 'password', 'oauth_id', 'oauth_provider'}


def private_keys_in(value):
    """Every private key anywhere in a JSON value."""
    if isinstance(value, dict):
        found = PRIVATE_KEYS & value.keys()
        for item in value.values():
            found |= private_keys_in(item)
        return found
    if isinstance(value, list):
        return set().union(*map(private_keys_in, value)) if value else set()
    return set()


def test_nothing_public_carries_private_fields(client, as_bob, alice, bob):
    album = make_album(alice, name='Searchable')
    song = make_song(album, name='Searchable song')
    playlist = make_playlist(alice, songs=[song])
    db.session.add(Like(song=song, user=bob))
    db.session.commit()

    responses = {
        url: client.get(url).get_json()
        for url in (
            '/api/albums',
            f'/api/albums/{album.id}',
            '/api/songs',
            f'/api/songs/{song.id}',
            f'/api/songs/{song.id}/likes',
            '/api/playlists',
            f'/api/playlists/{playlist.id}',
            '/api/search?q=searchable',
        )
    }
    # These need a login, but are about other people
    responses['/api/users/'] = as_bob.get('/api/users/').get_json()
    responses['/api/users/<alice>'] = as_bob.get(f'/api/users/{alice.id}').get_json()
    responses['/api/songs/liked'] = as_bob.get('/api/songs/liked').get_json()

    assert {url: private_keys_in(body) for url, body in responses.items()} == {
        url: set() for url in responses
    }


def test_only_your_own_account_includes_your_email(as_alice, alice):
    me = as_alice.get('/api/auth/').get_json()

    assert me['email'] == alice.email
    assert 'hashed_password' not in me


def test_payload_shapes(client, alice):
    album = make_album(alice)
    song = make_song(album)
    playlist = make_playlist(alice, songs=[song])

    album_json = client.get(f'/api/albums/{album.id}').get_json()
    song_json = client.get(f'/api/songs/{song.id}').get_json()
    playlist_json = client.get(f'/api/playlists/{playlist.id}').get_json()

    assert set(album_json) == ALBUM_KEYS
    assert set(album_json['user']) == USER_KEYS
    assert set(album_json['songs'][0]) == SONG_KEYS
    assert set(song_json) == SONG_KEYS
    assert set(playlist_json) == PLAYLIST_KEYS
    assert set(playlist_json['playlist_songs'][0]) == PLAYLIST_SONG_KEYS
    assert set(playlist_json['playlist_songs'][0]['song']) == SONG_KEYS
    # Timestamps are UTC ISO 8601, with the Z the browser needs to read them
    assert album_json['created_at'].endswith('Z')
