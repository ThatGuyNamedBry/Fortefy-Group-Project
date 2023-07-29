from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import Song, Like

# NEED to add prefix line to app/init.py
song_routes = Blueprint('song', __name__)

@song_routes.route('')
def get_all_songs():
    """
    Query for all songs and returns them in a list of song dictionaries
    """
    songs = [song.to_dict() for song in Song.query.all()]
    return jsonify(songs)

@song_routes.route('/<int:id>')
def get_song_by_id(id):
    """
    Query for a song by id and returns that song in a dictionary
    """
    song = Song.query.get(id)
    return jsonify(song.to_dict())

@song_routes.route('/current')
@login_required
def get_user_songs():
    """
    Query for all songs created by the current user and return them in a list of song dictionaries
    """
    user_songs = Song.query.filter(Song.user_id == current_user.id)
    songs_dict = [song.to_dict() for song in user_songs]
    return jsonify(songs_dict)

# @song_routes.route('/<int:id>/add-like', methods=['POST'])
# @login_required
# def add_song_like(id):
#     """
#     Adds a like to the selected song and return the like in a dictionary
#     """
#     song = Song.query.get(id).to_dict()
#     index = song.likes
#     print(song)

    # is_liked = Like.query.filter(Like.user_id == current_user.id)
    # print(is_liked)
    # return "hi"
