from flask import Blueprint, jsonify
from flask_login import login_required
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
    print("playlist", playlist)
    return jsonify(playlist.to_dict())
