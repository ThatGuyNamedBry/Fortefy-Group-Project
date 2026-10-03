import io

import pytest

from conftest import make_album, make_song, wav_file
from app.models import Like, Song, db


def test_upload_a_song(as_alice, alice, s3):
    album = make_album(alice)

    response = as_alice.post(
        f'/api/albums/{album.id}/song',
        data={'name': 'Hello', 'track_number': 1, 'song': wav_file(seconds=2)},
    )

    assert response.status_code == 200
    song = response.get_json()
    assert song['name'] == 'Hello'
    assert song['duration'] == 2
    assert song['album_id'] == album.id
    # Stored under a fresh random name, never the one it was uploaded with
    assert len(s3.uploaded) == 1 and s3.uploaded[0] != 'tone.wav'
    assert song['song_url'].endswith(s3.uploaded[0])


def test_a_file_that_is_not_audio_is_refused(as_alice, alice, s3):
    album = make_album(alice)

    response = as_alice.post(
        f'/api/albums/{album.id}/song',
        data={'name': 'Fake', 'track_number': 1, 'song': (io.BytesIO(b'not audio'), 'fake.mp3')},
    )

    assert response.status_code == 400
    assert response.get_json()['errors'] == {'song': 'File is not a playable .mp3 file'}
    assert s3.uploaded == []
    assert Song.query.count() == 0


@pytest.mark.parametrize(
    'fields, field',
    [
        ({'name': ''}, 'name'),
        ({'track_number': 0}, 'track_number'),
        ({'song': (io.BytesIO(b'text'), 'notes.txt')}, 'song'),
        ({'song': None}, 'song'),
    ],
)
def test_upload_validation(as_alice, alice, fields, field):
    album = make_album(alice)
    data = {'name': 'Hello', 'track_number': 1, 'song': wav_file(), **fields}
    data = {key: value for key, value in data.items() if value is not None}

    response = as_alice.post(f'/api/albums/{album.id}/song', data=data)

    assert response.status_code == 400
    assert field in response.get_json()['errors']


def test_an_s3_failure_stores_no_song(as_alice, alice, s3):
    album = make_album(alice)
    s3.fail_uploads = True

    response = as_alice.post(
        f'/api/albums/{album.id}/song',
        data={'name': 'Hello', 'track_number': 1, 'song': wav_file()},
    )

    assert response.status_code == 502
    assert Song.query.count() == 0


def test_edit_a_song(as_alice, alice):
    song = make_song(make_album(alice))

    response = as_alice.put(f'/api/songs/{song.id}', data={'name': 'Renamed', 'track_number': 4})

    assert response.status_code == 200
    assert response.get_json()['name'] == 'Renamed'
    assert db.session.get(Song, song.id).track_number == 4


def test_delete_a_song_and_its_file(as_alice, alice, s3):
    song = make_song(make_album(alice))
    song_id, url = song.id, song.song_url

    response = as_alice.delete(f'/api/songs/{song_id}/delete')

    assert response.status_code == 200
    assert db.session.get(Song, song_id) is None
    assert s3.removed == [url]


def test_like_and_unlike(as_bob, client, alice, bob):
    song = make_song(make_album(alice))
    url = f'/api/songs/{song.id}'

    assert as_bob.post(f'{url}/add-like').status_code == 200
    assert as_bob.post(f'{url}/add-like').status_code == 409
    assert Like.query.filter_by(song_id=song.id).count() == 1

    # Anyone may see who liked a song, and songs carry their likes in brief
    likes = client.get(f'{url}/likes').get_json()
    assert [like['user'] for like in likes] == [{'id': bob.id, 'username': 'Bob'}]
    assert client.get(url).get_json()['likes'] == [{'id': likes[0]['id'], 'user_id': bob.id}]
    assert [s['id'] for s in as_bob.get('/api/songs/liked').get_json()] == [song.id]

    assert as_bob.delete(f'{url}/remove-like').status_code == 200
    assert as_bob.delete(f'{url}/remove-like').status_code == 404
    assert Like.query.count() == 0


def test_liked_songs_are_most_recent_first(as_bob, alice):
    album = make_album(alice)
    first, second = make_song(album, name='First'), make_song(album, name='Second')
    as_bob.post(f'/api/songs/{first.id}/add-like')
    as_bob.post(f'/api/songs/{second.id}/add-like')

    liked = as_bob.get('/api/songs/liked').get_json()

    assert [song['name'] for song in liked] == ['Second', 'First']


def test_song_lists(client, as_alice, alice, bob):
    make_song(make_album(alice), name='Mine')
    make_song(make_album(bob), name='Theirs')

    assert sorted(s['name'] for s in client.get('/api/songs').get_json()) == ['Mine', 'Theirs']
    assert [s['name'] for s in as_alice.get('/api/songs/current').get_json()] == ['Mine']
    assert client.get('/api/songs/999999').status_code == 404
