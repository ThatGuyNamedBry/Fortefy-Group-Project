import pytest

from conftest import PASSWORD


def signup(client, **fields):
    data = {'username': 'Newbie', 'email': 'newbie@example.com', 'password': 'secret1', **fields}
    return client.post('/api/auth/signup', data=data)


def test_signup_logs_the_new_user_in(client):
    response = signup(client)

    assert response.status_code == 200
    assert response.get_json()['email'] == 'newbie@example.com'
    me = client.get('/api/auth/').get_json()
    assert me['username'] == 'Newbie'
    assert 'hashed_password' not in me


@pytest.mark.parametrize(
    'fields, field, message',
    [
        ({'username': ''}, 'username', 'This field is required.'),
        ({'username': 'abc'}, 'username', 'Field must be between 4 and 40 characters long.'),
        ({'username': 'x' * 41}, 'username', 'Field must be between 4 and 40 characters long.'),
        ({'email': 'not-an-email'}, 'email', 'Invalid email address.'),
        ({'password': 'short'}, 'password', 'Field must be at least 6 characters long.'),
    ],
)
def test_signup_validation(client, fields, field, message):
    response = signup(client, **fields)

    assert response.status_code == 401
    assert response.get_json()['errors'][field] == message


def test_signup_refuses_a_taken_email_or_username(client, alice):
    taken_email = signup(client, email=alice.email)
    taken_username = signup(client, username=alice.username, email='other@example.com')

    assert taken_email.get_json()['errors'] == {'email': 'Email address is already in use.'}
    assert taken_username.get_json()['errors'] == {'username': 'Username is already in use.'}


def test_login_and_logout(client, alice):
    response = client.post('/api/auth/login', data={'email': alice.email, 'password': PASSWORD})
    assert response.status_code == 200
    assert response.get_json()['id'] == alice.id

    assert client.get('/api/albums/current').status_code == 200
    assert client.post('/api/auth/logout').status_code == 200
    assert client.get('/api/albums/current').status_code == 401


def test_login_with_a_wrong_password(client, alice):
    response = client.post('/api/auth/login', data={'email': alice.email, 'password': 'wrong'})

    assert response.status_code == 401
    assert response.get_json()['errors'] == {'password': 'Password was incorrect.'}


def test_login_with_an_unknown_email(client):
    response = client.post(
        '/api/auth/login', data={'email': 'nobody@example.com', 'password': PASSWORD}
    )

    assert response.status_code == 401
    assert response.get_json()['errors']['email'] == 'Email provided not found.'


def test_requests_without_the_csrf_header_are_refused(client, alice):
    response = client.post(
        '/api/auth/login', data={'email': alice.email, 'password': PASSWORD}, csrf=False
    )

    assert response.status_code == 401
    assert 'csrf_token' in response.get_json()['errors']
    assert 'email' not in client.get('/api/auth/').get_json()


def test_not_logged_in_is_a_plain_401(client):
    # A 401 straight away, not a redirect to a page that says 401
    response = client.get('/api/songs/liked')

    assert response.status_code == 401
    assert response.get_json() == {'errors': ['Unauthorized']}
