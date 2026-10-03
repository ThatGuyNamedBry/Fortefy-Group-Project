"""
Shared fixtures for the API tests.

The Flask app is a module-level singleton that reads its configuration from
the environment when it is imported, so the environment is set before the
import: an in-memory SQLite database, a fixed secret key, and none of the
production, Google or S3 settings a developer's shell might carry.
"""

import io
import os
import wave

import pytest
from werkzeug.security import generate_password_hash

os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['SECRET_KEY'] = 'test-secret-key'
for name in (
    'FLASK_ENV',
    'SCHEMA',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'S3_BUCKET',
    'S3_KEY',
    'S3_SECRET',
):
    os.environ.pop(name, None)

import app.api.album_routes as album_routes  # noqa: E402
import app.api.aws_helper as aws_helper  # noqa: E402
import app.api.song_routes as song_routes  # noqa: E402
from app import app as flask_app  # noqa: E402
from app.models import Album, Playlist, PlaylistSong, Song, User, db  # noqa: E402

PASSWORD = 'password'


@pytest.fixture
def app():
    """A fresh, empty database for every test."""
    flask_app.config['TESTING'] = True
    with flask_app.app_context():
        # SQLALCHEMY_ECHO is on outside production; it only adds noise here
        db.engine.echo = False
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


class ApiClient:
    """
    A test client that sends the CSRF token the way the frontend does: read
    from the csrf_token cookie and sent back in the X-CSRFToken header.

    Each request runs in an app context of its own, as it would in production.
    Flask would otherwise reuse the test's context, so every request in a test
    would share one database session and one flask.g, which caches the CSRF
    token across clients.
    """

    def __init__(self, app):
        self.app = app
        self.client = app.test_client()
        # Any response hands out the cookie
        self.get('/api/auth/')

    def csrf_token(self):
        return self.client.get_cookie('csrf_token').value

    def send(self, method, url, csrf=True, **kwargs):
        headers = dict(kwargs.pop('headers', None) or {})
        if csrf:
            headers['X-CSRFToken'] = self.csrf_token()
        with self.app.app_context():
            response = self.client.open(url, method=method, headers=headers, **kwargs)
        # So the test's own queries see what the request changed
        db.session.expire_all()
        return response

    def get(self, url, **kwargs):
        return self.send('GET', url, csrf=False, **kwargs)

    def post(self, url, **kwargs):
        return self.send('POST', url, **kwargs)

    def put(self, url, **kwargs):
        return self.send('PUT', url, **kwargs)

    def delete(self, url, **kwargs):
        return self.send('DELETE', url, **kwargs)

    def login(self, user):
        response = self.post('/api/auth/login', data={'email': user.email, 'password': PASSWORD})
        assert response.status_code == 200, response.get_json()
        return response


@pytest.fixture
def client(app):
    """Not logged in."""
    return ApiClient(app)


@pytest.fixture
def make_client(app):
    """A client logged in as the given user."""

    def make(user):
        api = ApiClient(app)
        api.login(user)
        return api

    return make


# Hashing is slow on purpose, and every test makes users, so they share one
PASSWORD_HASH = generate_password_hash(PASSWORD)


def make_user(username):
    user = User(username=username, email=f'{username.lower()}@example.com')
    user.hashed_password = PASSWORD_HASH
    db.session.add(user)
    db.session.commit()
    return user


def make_album(user, **fields):
    album = Album(
        user=user,
        **{'name': 'An Album', 'artist': 'An Artist', 'year': 2020, 'genre': 'Rock', **fields},
    )
    db.session.add(album)
    db.session.commit()
    return album


def make_song(album, **fields):
    song = Song(
        user=album.user,
        album=album,
        **{
            'name': 'A Song',
            'duration': 60,
            'track_number': 1,
            'song_url': f'{aws_helper.S3_LOCATION}{"0" * 32}.mp3',
            **fields,
        },
    )
    db.session.add(song)
    db.session.commit()
    return song


def make_playlist(user, songs=(), **fields):
    playlist = Playlist(user=user, **{'title': 'A Playlist', 'description': '', **fields})
    db.session.add(playlist)
    for song in songs:
        db.session.add(PlaylistSong(playlist=playlist, song=song))
    db.session.commit()
    return playlist


@pytest.fixture
def alice(app):
    return make_user('Alice')


@pytest.fixture
def bob(app):
    return make_user('Bob')


@pytest.fixture
def as_alice(make_client, alice):
    return make_client(alice)


@pytest.fixture
def as_bob(make_client, bob):
    return make_client(bob)


def wav_file(seconds=1.0, name='tone.wav'):
    """A real, silent WAV file, so mutagen can measure it like an upload."""
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(8000)
        wav.writeframes(b'\x00\x00' * int(8000 * seconds))
    buffer.seek(0)
    return buffer, name


class FakeS3:
    """Stands in for the S3 helpers the routes import, and records the calls."""

    def __init__(self):
        self.uploaded = []
        self.removed = []
        self.fail_uploads = False

    def upload(self, file, acl='public-read'):
        if self.fail_uploads:
            return {'errors': 'S3 is unavailable'}
        self.uploaded.append(file.filename)
        return {'url': f'{aws_helper.S3_LOCATION}{file.filename}'}

    def remove(self, url):
        self.removed.append(url)


@pytest.fixture(autouse=True)
def s3(monkeypatch):
    """No test ever talks to S3."""
    fake = FakeS3()
    monkeypatch.setattr(album_routes, 'upload_file_to_s3', fake.upload)
    monkeypatch.setattr(album_routes, 'remove_file_from_s3', fake.remove)
    monkeypatch.setattr(song_routes, 'remove_file_from_s3', fake.remove)
    return fake
