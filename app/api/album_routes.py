from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import Album

album_routes = Blueprint('albums', __name__)

@album_routes.route('')
def get_all_albums():
    """
    Query for all albums and returns them in a list of album dictionaries
    """
    return jsonify([album.to_dict() for album in Album.query.all()])

@album_routes.route('/<int:id>')
def get_album_by_id(id):
    """
    Query for an album by id and returns that album in a dictionary
    """
    album = Album.query.get(id)
    return jsonify(album.to_dict())

@album_routes.route('/current')
def get_user_albums():
    """
    Query for all albums created by the current user and return them in a list of album dictionaries
    """
    if current_user.is_authenticated:
        user_albums = Album.query.filter(Album.user_id == current_user.id)
        albums_dict = [album.to_dict() for album in user_albums]
        return jsonify(albums_dict)

    return {'errors': ['User is not logged in']}
