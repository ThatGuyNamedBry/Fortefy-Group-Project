import os
from flask import Flask, request, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import generate_csrf
from flask_login import LoginManager
from .models import db, User
from .api import user_routes, auth_routes, album_routes, playlist_routes, song_routes, search_routes
from .seeds import seed_commands
from .config import Config
from .oauth import init_oauth

app = Flask(__name__, static_folder='../react-app/build', static_url_path='/')

# Setup login manager
login = LoginManager(app)
# A 401 straight away. With a login_view instead, every protected route
# answered a 302 redirect to that view, which then said 401.
login.unauthorized_handler(auth_routes.unauthorized)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(user_routes.user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes.auth_routes, url_prefix='/api/auth')
app.register_blueprint(album_routes.album_routes, url_prefix='/api/albums')
app.register_blueprint(song_routes.song_routes, url_prefix='/api/songs')
app.register_blueprint(playlist_routes.playlist_routes, url_prefix='/api/playlists')
app.register_blueprint(search_routes.search_routes, url_prefix='/api/search')
db.init_app(app)
Migrate(app, db)
init_oauth(app)

# Application Security
# In production the React build is served from this same origin, so no cross
# origin request is ever legitimate. In development the CRA dev server proxies
# /api to us, so this only matters if someone points a browser on port 3000
# straight at port 5000.
if os.environ.get('FLASK_ENV') != 'production':
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)


# Since we are deploying with Docker and Flask,
# we won't be using a buildpack when we deploy to Heroku.
# Therefore, we need to make sure that in production any
# request made over http is redirected to https.
# Well.........
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)


@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get('FLASK_ENV') == 'production' else None,
        # Readable by our own JavaScript on purpose: it has to copy the token
        # into the X-CSRFToken header, which is the half of the double submit
        # another origin cannot forge. The token is not a credential, so there
        # is nothing here worth hiding from the page that already has the
        # session
        httponly=False,
    )
    return response


@app.route('/api/docs')
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = {
        rule.rule: [
            [method for method in rule.methods if method in acceptable_methods],
            app.view_functions[rule.endpoint].__doc__,
        ]
        for rule in app.url_map.iter_rules()
        if rule.endpoint != 'static'
    }
    return route_list


def is_api_request():
    """
    Whether this request was aimed at the API rather than at the React app.

    Errors under /api have to answer with JSON. Handing back index.html means
    a thunk's response.json() chokes on HTML, and an unknown /api route looks
    like a successful 200 rather than the 404 it is.
    """
    return request.path.startswith('/api/')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """
    Serves the React app's index.html. Only / ever lands here: the static
    route (static_url_path='/') matches every other path first and serves the
    file if the build has one, such as favicon.ico, and the 404 handler below
    answers the rest, in JSON under /api
    """
    return app.send_static_file('index.html')


@app.errorhandler(404)
def not_found(e):
    if is_api_request():
        return {'errors': 'Not found'}, 404
    return app.send_static_file('index.html')


@app.errorhandler(405)
def method_not_allowed(e):
    if is_api_request():
        return {'errors': 'Method not allowed'}, 405
    return e


@app.errorhandler(413)
def request_too_large(e):
    if is_api_request():
        limit = app.config['MAX_CONTENT_LENGTH'] // (1024 * 1024)
        return {'errors': f'File is too large. The limit is {limit} MB.'}, 413
    return e


@app.errorhandler(500)
def internal_server_error(e):
    if is_api_request():
        return {'errors': 'Internal server error'}, 500
    return e
