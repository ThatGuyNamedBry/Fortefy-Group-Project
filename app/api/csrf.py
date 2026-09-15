from flask import request


def csrf_token_from_request():
    """
    The CSRF token the client sent with this request.

    It has to arrive in the X-CSRFToken header rather than in the cookie. The
    browser attaches the cookie to cross-site requests by itself, so reading the
    token from it meant the check could never fail; the same origin policy stops
    another site reading our cookie to set the header, so this half of the
    double submit is the half that actually proves the request came from us.

    Returns '' rather than raising when the header is absent, so a request
    without one fails form validation with clean JSON instead of blowing up with
    a BadRequestKeyError.
    """
    return request.headers.get('X-CSRFToken', '')
