import io

from conftest import make_album, make_song


def test_an_unknown_api_route_is_a_json_404(client):
    response = client.get('/api/no-such-thing')

    assert response.status_code == 404
    assert response.get_json() == {'errors': 'Not found'}


def test_the_wrong_method_is_a_json_405(client):
    response = client.send('PATCH', '/api/albums', csrf=False)

    assert response.status_code == 405
    assert response.get_json() == {'errors': 'Method not allowed'}


def test_an_oversized_upload_is_a_json_413(app, as_alice, alice):
    album = make_album(alice)
    app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
    try:
        response = as_alice.post(
            f'/api/albums/{album.id}/song',
            data={'name': 'Big', 'track_number': 1, 'song': (io.BytesIO(b'0' * 2 * 1024 * 1024), 'big.wav')},
        )
    finally:
        app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    assert response.status_code == 413
    assert response.get_json() == {'errors': 'File is too large. The limit is 1 MB.'}


def test_search_finds_songs_and_albums_by_name_or_artist(client, alice):
    album = make_album(alice, name='Night Drive', artist='The Owls')
    make_song(album, name='Highway')
    make_song(make_album(alice, name='Elsewhere', artist='Nobody'), name='Daylight')

    by_song = client.get('/api/search?q=highway').get_json()
    by_artist = client.get('/api/search?q=OWLS').get_json()

    assert [song['name'] for song in by_song['songs']] == ['Highway']
    assert [album['name'] for album in by_artist['albums']] == ['Night Drive']
    assert [song['name'] for song in by_artist['songs']] == ['Highway']


def test_search_wildcards_are_literal(client, alice):
    make_album(alice, name='100% Pure')
    make_album(alice, name='Anything else')

    found = client.get('/api/search?q=100%25').get_json()
    everything = client.get('/api/search?q=%25').get_json()

    assert [album['name'] for album in found['albums']] == ['100% Pure']
    assert [album['name'] for album in everything['albums']] == ['100% Pure']


def test_an_empty_search_finds_nothing(client, alice):
    make_album(alice)

    assert client.get('/api/search?q=').get_json() == {'songs': [], 'albums': []}
