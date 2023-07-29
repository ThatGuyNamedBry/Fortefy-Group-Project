from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import Playlist

# NEED to add prefix line to app/init.py
playlist_routes = Blueprint('playlists', __name__)

@playlist_routes.route('')
def get_all_playlists():
    """
    Query for all playlists and returns them in a list of playlist dictionaries
    """
    playlists = [playlist.to_dict() for playlist in Playlist.query.all()]
    return jsonify(playlists)

@playlist_routes.route('/<int:id>')
def get_playlist_by_id(id):
    """
    Query for a playlist by id and returns that playlist in a dictionary
    """
    playlist = Playlist.query.get(id)
    return jsonify(playlist.to_dict())

@playlist_routes.route('/current')
@login_required
def get_user_playlists():
    """
    Query for all playlists created by the current user and return them in a list of playlist dictionaries
    """
    user_playlists = Playlist.query.filter(Playlist.user_id == current_user.id)
    playlists_dict = [playlist.to_dict() for playlist in user_playlists]
    return jsonify(playlists_dict)
