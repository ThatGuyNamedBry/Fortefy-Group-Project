from flask import Blueprint, jsonify
from flask_login import login_required
from app.models import User

user_routes = Blueprint('users', __name__)


# Both routes here serialise with the public User.to_dict(), so they no longer
# hand out email addresses. Nothing in the frontend calls either of them today;
# they are kept as the starting point for the public-profile feature.


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of public user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a public dictionary
    """
    user = User.query.get(id)

    if user is None:
        return { 'errors': 'User not found' }, 404

    return user.to_dict()