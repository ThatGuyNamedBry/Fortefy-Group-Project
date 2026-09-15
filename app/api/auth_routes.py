from urllib.parse import urlencode

from authlib.integrations.base_client.errors import OAuthError
from flask import Blueprint, jsonify, session, request, redirect, url_for, current_app
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from app.oauth import oauth, google_enabled, unique_username
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint('auth', __name__)


def validation_errors_to_error_object(validation_errors):
    """
    Turns the WTForms validation errors into the one error shape every route
    answers with, { field: message }. Only the first message for a field is
    kept, which is the most fundamental one: WTForms reports in validator
    order, so 'This field is required.' comes before a length or range
    complaint about the same value.

    The forms in the browser already read errors this way, keyed by field, so
    this is the shape they can actually render.
    """
    return {field: errors[0]
            for field, errors in validation_errors.items() if errors}


@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': ['Unauthorized']}


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    # Get the csrf_token from the request cookie and put it into the
    # form manually to validate_on_submit can be used
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        # Add the user to the session, we are logged in!
        user = User.query.filter(User.email == form.data['email']).first()
        login_user(user)
        return user.to_dict()
    return {'errors': validation_errors_to_error_object(form.errors)}, 401


@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        user = User(
            username=form.data['username'],
            email=form.data['email'],
            password=form.data['password']
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return user.to_dict()
    return {'errors': validation_errors_to_error_object(form.errors)}, 401


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {'errors': ['Unauthorized']}, 401


def oauth_failure(message):
    """
    Sends the browser back to the site with an error for the login modal to
    show. OAuth finishes as a full page redirect rather than a fetch, so we
    cannot just return JSON here.
    """
    return redirect(f'/?{urlencode({"oauth_error": message})}')


@auth_routes.route('/oauth/providers')
def oauth_providers():
    """
    Reports which OAuth providers this deployment has configured, so the
    frontend only renders buttons that will actually work
    """
    return {'google': google_enabled()}


@auth_routes.route('/oauth/google')
def google_login():
    """
    Starts the Google OAuth flow by redirecting to Google's consent screen
    """
    if not google_enabled():
        return oauth_failure('Google login is not configured on this server.')

    redirect_uri = (current_app.config.get('GOOGLE_REDIRECT_URI')
                    or url_for('auth.google_callback', _external=True))
    return oauth.google.authorize_redirect(redirect_uri)


@auth_routes.route('/oauth/google/callback')
def google_callback():
    """
    Finishes the Google OAuth flow, then logs in the matching user, creating or
    linking their account first if needed
    """
    if not google_enabled():
        return oauth_failure('Google login is not configured on this server.')

    try:
        # Verifies the state we set in /oauth/google, exchanges the code for a
        # token and validates the returned id_token
        token = oauth.google.authorize_access_token()
    except OAuthError:
        return oauth_failure('Google login was cancelled or failed.')

    userinfo = token.get('userinfo') or {}
    google_id = userinfo.get('sub')
    email = userinfo.get('email')

    if not google_id or not email:
        return oauth_failure('Google did not share an email address with us.')
    if not userinfo.get('email_verified'):
        return oauth_failure('Your Google email address is not verified.')

    user = User.query.filter(
        User.oauth_provider == 'google', User.oauth_id == google_id).first()

    if not user:
        existing = User.query.filter(User.email == email).first()
        if existing:
            # Google vouched for this address above, so the person clicking
            # through is the owner of the existing account. Link the two rather
            # than failing on the unique email constraint.
            existing.oauth_provider = 'google'
            existing.oauth_id = google_id
            user = existing
        else:
            user = User(
                username=unique_username(email, userinfo.get('name')),
                email=email,
                oauth_provider='google',
                oauth_id=google_id,
            )
            db.session.add(user)
        db.session.commit()

    login_user(user)
    return redirect('/')
