import pytest

from conftest import make_album, make_playlist, make_song
from app.models import Album, Like, PlaylistSong, Song, db


def album_data(**fields):
    return {
        'name': 'Debut',
        'artist': 'The Testers',
        'year': 2024,
        'genre': 'Pop',
        'art': '',
        **fields,
    }


def test_create_an_album(as_alice, alice):
    response = as_alice.post('/api/albums/newAlbum', data=album_data())

    assert response.status_code == 200
    album = response.get_json()
    assert album['name'] == 'Debut'
    assert album['user'] == {'id': alice.id, 'username': 'Alice'}
    assert album['songs'] == []


def test_no_art_is_stored_as_null(as_alice):
    created = as_alice.post('/api/albums/newAlbum', data=album_data()).get_json()
    assert created['art'] is None

    with_art = as_alice.put(
        f'/api/albums/edit/{created["id"]}', data=album_data(art='https://example.com/a.jpg')
    ).get_json()
    assert with_art['art'] == 'https://example.com/a.jpg'

    cleared = as_alice.put(f'/api/albums/edit/{created["id"]}', data=album_data(art='')).get_json()
    assert cleared['art'] is None


@pytest.mark.parametrize(
    'fields, field',
    [
        ({'name': ''}, 'name'),
        ({'artist': ''}, 'artist'),
        ({'genre': ''}, 'genre'),
        ({'year': ''}, 'year'),
        ({'year': 0}, 'year'),
        ({'year': 10000}, 'year'),
        ({'artist': 'x' * 51}, 'artist'),
        ({'art': 'https://example.com/not-an-image.txt'}, 'art'),
    ],
)
def test_album_validation(as_alice, fields, field):
    response = as_alice.post('/api/albums/newAlbum', data=album_data(**fields))

    assert response.status_code == 400
    assert field in response.get_json()['errors']
    assert Album.query.count() == 0


def test_edit_an_album(as_alice, alice):
    album = make_album(alice)

    response = as_alice.put(f'/api/albums/edit/{album.id}', data=album_data(name='Second'))

    assert response.status_code == 200
    db.session.expire_all()
    assert db.session.get(Album, album.id).name == 'Second'


def test_deleting_an_album_takes_its_songs_likes_and_playlist_entries(as_alice, alice, bob, s3):
    album = make_album(alice)
    songs = [make_song(album, track_number=n) for n in (1, 2)]
    db.session.add(Like(song=songs[0], user=bob))
    db.session.commit()
    make_playlist(bob, songs=songs)
    urls = [song.song_url for song in songs]

    response = as_alice.delete(f'/api/albums/{album.id}/delete')

    assert response.status_code == 200
    db.session.expire_all()
    assert Album.query.count() == 0
    assert Song.query.count() == 0
    assert Like.query.count() == 0
    assert PlaylistSong.query.count() == 0
    # The files go too, once the rows are gone
    assert sorted(s3.removed) == sorted(urls)


def test_album_lists(client, as_alice, alice, bob):
    make_album(alice, name='Mine')
    make_album(bob, name='Theirs')

    everyone = client.get('/api/albums').get_json()
    mine = as_alice.get('/api/albums/current').get_json()

    assert sorted(album['name'] for album in everyone) == ['Mine', 'Theirs']
    assert [album['name'] for album in mine] == ['Mine']


def test_one_album(client, alice):
    album = make_album(alice)
    make_song(album)

    response = client.get(f'/api/albums/{album.id}')

    assert response.status_code == 200
    assert [song['name'] for song in response.get_json()['songs']] == ['A Song']
    assert client.get('/api/albums/999999').status_code == 404
