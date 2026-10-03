"""
Google sign in, with a stand-in for Authlib's Google client so nothing talks
to Google.
"""

from types import SimpleNamespace
from urllib.parse import parse_qs, urlparse

import pytest
from authlib.integrations.base_client.errors import OAuthError

import app.api.auth_routes as auth_routes
from conftest import make_user
from app.models import User, db
from app.oauth import unique_username


class FakeGoogle:
    def __init__(self, userinfo=None, error=False):
        self.userinfo = userinfo
        self.error = error

    def authorize_access_token(self):
        if self.error:
            raise OAuthError(error='access_denied')
        return {'userinfo': self.userinfo}


@pytest.fixture
def google(app, monkeypatch):
    """Google credentials configured, and Google answering with `userinfo`."""
    monkeypatch.setitem(app.config, 'GOOGLE_CLIENT_ID', 'client-id')
    monkeypatch.setitem(app.config, 'GOOGLE_CLIENT_SECRET', 'client-secret')

    def answer(**kwargs):
        monkeypatch.setattr(auth_routes, 'oauth', SimpleNamespace(google=FakeGoogle(**kwargs)))

    return answer


def userinfo(**fields):
    return {
        'sub': 'google-123',
        'email': 'gina@example.com',
        'email_verified': True,
        'name': 'Gina Google',
        **fields,
    }


def oauth_error(response):
    assert response.status_code == 302
    return parse_qs(urlparse(response.headers['Location']).query).get('oauth_error', [None])[0]


def test_providers_follow_the_configuration(client, google):
    assert client.get('/api/auth/oauth/providers').get_json() == {'google': True}


def test_google_is_off_without_credentials(client):
    assert client.get('/api/auth/oauth/providers').get_json() == {'google': False}
    response = client.get('/api/auth/oauth/google/callback')
    assert oauth_error(response) == 'Google login is not configured on this server.'


def test_a_new_google_user_gets_an_account(client, google):
    google(userinfo=userinfo())

    response = client.get('/api/auth/oauth/google/callback')

    assert response.status_code == 302 and response.headers['Location'].endswith('/')
    me = client.get('/api/auth/').get_json()
    assert me['email'] == 'gina@example.com'
    assert me['username'] == 'GinaGoogle'
    user = db.session.get(User, me['id'])
    assert (user.oauth_provider, user.oauth_id, user.hashed_password) == (
        'google',
        'google-123',
        None,
    )


def test_an_existing_email_is_linked_not_duplicated(client, google, alice):
    google(userinfo=userinfo(email=alice.email))

    client.get('/api/auth/oauth/google/callback')

    assert client.get('/api/auth/').get_json()['id'] == alice.id
    assert User.query.count() == 1
    assert db.session.get(User, alice.id).oauth_id == 'google-123'


def test_a_linked_account_logs_straight_in(client, google, alice):
    alice.oauth_provider, alice.oauth_id = 'google', 'google-123'
    db.session.commit()
    # Even with a different email on the Google side now
    google(userinfo=userinfo(email='new-address@example.com'))

    client.get('/api/auth/oauth/google/callback')

    assert client.get('/api/auth/').get_json()['id'] == alice.id


@pytest.mark.parametrize(
    'answer, message',
    [
        ({'error': True}, 'Google login was cancelled or failed.'),
        ({'userinfo': userinfo(email=None)}, 'Google did not share an email address with us.'),
        (
            {'userinfo': userinfo(email_verified=False)},
            'Your Google email address is not verified.',
        ),
    ],
)
def test_google_failures_go_back_with_a_message(client, google, answer, message):
    google(**answer)

    response = client.get('/api/auth/oauth/google/callback')

    assert oauth_error(response) == message
    assert 'email' not in client.get('/api/auth/').get_json()
    assert User.query.count() == 0


def test_unique_usernames(app):
    make_user('GinaGoogle')

    assert unique_username('gina@example.com', 'Gina Google') == 'GinaGoogle2'
    # Too short a name falls back to the email address, then pads it out
    assert unique_username('someone@example.com', 'Al') == 'someone'
    assert unique_username('jo@example.com', None) == 'jouser'
