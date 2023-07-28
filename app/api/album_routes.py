from flask import Blueprint, jsonify
from flask_login import login_required
from app.models import Album

album_routes = Blueprint('albums', __name__)

@album_routes.route('')
def get_all_albums():
    """
    Query for all albums and returns them in a list of album dictionaries
    """
    return jsonify([album.to_dict() for album in Album.query.all()])
