"""
The S3 helpers themselves; the route tests swap them out. A fake client stands
in for boto3, so nothing here touches the network.
"""

import io
import logging

import pytest

import app.api.aws_helper as aws
from werkzeug.datastructures import FileStorage

SEED_URL = 'https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Artist/Album/Song.mp3'


class FakeClient:
    def __init__(self, fail=False):
        self.fail = fail
        self.calls = []

    def upload_fileobj(self, file, bucket, key, ExtraArgs):
        if self.fail:
            raise RuntimeError('no credentials')
        self.calls.append(('upload', bucket, key, ExtraArgs))

    def delete_object(self, Bucket, Key):
        if self.fail:
            raise RuntimeError('access denied')
        self.calls.append(('delete', Bucket, Key))


@pytest.fixture
def fake_s3(monkeypatch):
    def make(fail=False):
        client = FakeClient(fail)
        monkeypatch.setattr(aws, 's3', client)
        return client

    return make


def test_unique_filenames_are_random_and_keep_the_extension():
    first, second = aws.get_unique_filename('My Song.MP3'), aws.get_unique_filename('My Song.MP3')

    assert first != second
    assert aws.UPLOADED_KEY.fullmatch(first)
    assert first.endswith('.mp3')


@pytest.mark.parametrize(
    'url, key',
    [
        (f'{aws.S3_LOCATION}{"a" * 32}.mp3', f'{"a" * 32}.mp3'),
        # Anything else is not ours to delete
        (SEED_URL, None),
        (f'{aws.S3_LOCATION}free/{"a" * 32}.mp3', None),
        (f'{aws.S3_LOCATION}song.mp3', None),
        (f'https://elsewhere.example.com/{"a" * 32}.mp3', None),
        ('', None),
        (None, None),
    ],
)
def test_only_uploaded_files_have_a_key(url, key):
    assert aws.uploaded_key(url) == key


def test_upload(fake_s3):
    client = fake_s3()
    file = FileStorage(io.BytesIO(b'data'), filename='abc.mp3', content_type='audio/mpeg')

    result = aws.upload_file_to_s3(file)

    assert result == {'url': f'{aws.S3_LOCATION}abc.mp3'}
    assert client.calls[0][2] == 'abc.mp3'
    assert client.calls[0][3] == {'ACL': 'public-read', 'ContentType': 'audio/mpeg'}


def test_a_failed_upload_reports_the_error(fake_s3):
    fake_s3(fail=True)
    file = FileStorage(io.BytesIO(b'data'), filename='abc.mp3', content_type='audio/mpeg')

    assert aws.upload_file_to_s3(file) == {'errors': 'no credentials'}


def test_removing_an_uploaded_file(app, fake_s3):
    client = fake_s3()

    aws.remove_file_from_s3(f'{aws.S3_LOCATION}{"b" * 32}.wav')

    assert client.calls == [('delete', aws.BUCKET_NAME, f'{"b" * 32}.wav')]


def test_seeded_audio_is_never_deleted(app, fake_s3):
    client = fake_s3()

    aws.remove_file_from_s3(SEED_URL)

    assert client.calls == []


def test_a_failed_delete_is_logged_not_raised(app, fake_s3, caplog):
    fake_s3(fail=True)

    with caplog.at_level(logging.ERROR):
        aws.remove_file_from_s3(f'{aws.S3_LOCATION}{"c" * 32}.mp3')

    assert 'orphaned' in caplog.text
