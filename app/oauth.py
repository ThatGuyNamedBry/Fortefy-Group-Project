import re

from authlib.integrations.flask_client import OAuth
from flask import current_app

from .models import User

oauth = OAuth()

# Google publishes its OAuth2/OpenID Connect endpoints here, so Authlib can
# discover the authorize/token/jwks URLs rather than us hard coding them.
GOOGLE_METADATA_URL = 'https://accounts.google.com/.well-known/openid-configuration'


def init_oauth(app):
    """
    Registers every OAuth provider that has credentials configured. Providers
    without credentials are simply skipped, so the app still boots for anyone
    who has not set them up.
    """
    oauth.init_app(app)

    if app.config.get('GOOGLE_CLIENT_ID') and app.config.get('GOOGLE_CLIENT_SECRET'):
        oauth.register(
            name='google',
            client_id=app.config['GOOGLE_CLIENT_ID'],
            client_secret=app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url=GOOGLE_METADATA_URL,
            client_kwargs={'scope': 'openid email profile'},
        )


def google_enabled():
    """
    True when this deployment has Google credentials configured
    """
    return bool(
        current_app.config.get('GOOGLE_CLIENT_ID')
        and current_app.config.get('GOOGLE_CLIENT_SECRET')
    )


def unique_username(email, name=None):
    """
    Builds a username for a new OAuth user. Google does not give us anything
    guaranteed to be unique and readable, so we base it on their display name
    (falling back to the local part of their email) and add a number if that is
    already taken.
    """
    base = re.sub(r'[^A-Za-z0-9_.-]', '', name or '')
    if len(base) < 4:
        base = re.sub(r'[^A-Za-z0-9_.-]', '', email.split('@')[0])
    if len(base) < 4:
        base = f'{base}user'

    # Leave room for a numeric suffix inside the column's 40 character limit
    base = base[:30]

    candidate = base
    suffix = 1
    while User.query.filter(User.username == candidate).first():
        suffix += 1
        candidate = f'{base}{suffix}'
    return candidate
