from flask import g, request
from flask_wtf.csrf import validate_csrf
from wtforms.validators import ValidationError

# The methods that change something. GETs stay free of the token: Google sign
# in, for one, is a pair of plain navigations that cannot carry a header.
CHECKED_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}

# Login and signup answer every validation failure with a 401, so a bad token
# there is a 401 as well
LOGIN_ENDPOINTS = {'auth.login', 'auth.sign_up'}


def csrf_token_from_request():
    """
    The CSRF token the client sent with this request.

    It has to arrive in the X-CSRFToken header rather than in the cookie. The
    browser attaches the cookie to cross-site requests by itself, so reading the
    token from it meant the check could never fail; the same origin policy stops
    another site reading our cookie to set the header, so this half of the
    double submit is the half that actually proves the request came from us.
    """
    return request.headers.get('X-CSRFToken')


def check_csrf():
    """
    Refuses any POST, PUT, PATCH or DELETE without this session's CSRF token in
    its X-CSRFToken header, before the route runs.

    The check used to live in the forms, so routes that take no form (logout,
    likes, deletes, adding a song to a playlist) never made it. Checking every
    request here covers those, and any route added later.
    """
    # The endpoint is None when no route matched. Nothing will run then, and
    # the 404 or 405 says more than a CSRF error would
    if request.method not in CHECKED_METHODS or request.endpoint is None:
        return

    try:
        validate_csrf(csrf_token_from_request())
    except ValidationError as error:
        status = 401 if request.endpoint in LOGIN_ENDPOINTS else 400
        return {'errors': {'csrf_token': error.args[0]}}, status

    # The flag Flask-WTF's own CSRFProtect sets: the forms see it and skip
    # checking the token a second time
    g.csrf_valid = True
