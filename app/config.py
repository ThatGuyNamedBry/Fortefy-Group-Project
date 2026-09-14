import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SQLAlchemy 1.4 no longer supports url strings that start with 'postgres'
    # (only 'postgresql') but heroku's postgres add-on automatically sets the
    # url in the hidden config vars to start with postgres.
    # so the connection uri must be updated here (for production)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL').replace('postgres://', 'postgresql://')
    SQLALCHEMY_ECHO = True

    # Google OAuth. Left as None when the credentials are not in the .env, which
    # is how /api/auth/oauth/providers knows to tell the frontend not to render
    # the "Continue with Google" button.
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    # Optional override for the URL Google sends the user back to. Only needed
    # when Flask cannot work out its own public address (for example behind the
    # React dev server's proxy, where Flask sees port 5000 but the browser is on
    # port 3000).
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')

    # Google's callback is a cross-site navigation back to us, so the session
    # cookie holding the OAuth state has to survive it. 'Lax' is the weakest
    # setting that still allows that (a 'Strict' cookie would be withheld and
    # every login would fail state validation).
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
