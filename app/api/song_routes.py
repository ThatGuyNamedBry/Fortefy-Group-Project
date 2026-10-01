from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload, selectinload
from app.models import db, Song, Like
from app.forms import SongForm
from app.api.aws_helper import remove_file_from_s3

from app.api.auth_routes import validation_errors_to_error_object
from app.api.csrf import csrf_token_from_request

song_routes = Blueprint('song', __name__)

@song_routes.route('')
def get_all_songs():
    """
    Query for all songs and returns them in a list of song dictionaries
    """
    songs = [song.to_dict() for song in Song.query.options(*Song.to_dict_loads()).all()]
    return jsonify(songs)

@song_routes.route('/<int:id>')
def get_song_by_id(id):
    """
    Query for a song by id and returns that song in a dictionary
    """
    song = Song.query.options(*Song.to_dict_loads()).get(id)

    if song is None:
        return { 'errors': 'Song not found' }, 404

    return jsonify(song.to_dict())

@song_routes.route('/current')
@login_required
def get_user_songs():
    """
    Query for all songs created by the current user and return them in a list of song dictionaries
    """
    user_songs = Song.query.options(*Song.to_dict_loads()).filter(Song.user_id == current_user.id)
    songs_dict = [song.to_dict() for song in user_songs]
    return jsonify(songs_dict)

@song_routes.route('/liked')
@login_required
def get_liked_songs():
    """
    Query for all songs the current user has liked and return them in a list of song dictionaries, most recently liked first
    """
    user_likes = (Like.query
                  .options(joinedload(Like.song).options(*Song.to_dict_loads()))
                  .filter(Like.user_id == current_user.id)
                  .order_by(Like.id.desc())
                  .all())
    songs_dict = [like.song.to_dict() for like in user_likes]
    return jsonify(songs_dict)

# Public, like the likes every song already carries
@song_routes.route("/<int:id>/likes")
def get_song_likes(id):
    """
    Query for a song by id and return a list of like dictionaries for that song
    """
    song = Song.query.options(selectinload(Song.likes).joinedload(Like.user)).get(id)

    if song is None:
        return { 'errors': 'Song not found' }, 404

    # The full likes, users included: songs themselves only carry each like's
    # id and user_id now
    return jsonify([like.to_dict() for like in song.likes])

@song_routes.route('/<int:id>/add-like', methods=['POST'])
@login_required
def add_song_like(id):
    """
    Add a like to a selected song and return likes for the song in a list of like dictionaries
    """
    if Song.query.get(id) is None:
        return { 'errors': 'Song not found' }, 404

    if Like.query.filter_by(song_id=id, user_id=current_user.id).first():
        return { "errors": "User has already liked song" }, 409

    like = Like(
        song_id=id,
        user_id=current_user.id
    )

    db.session.add(like)
    try:
        db.session.commit()
    except IntegrityError:
        # Another request liked it between the check above and this insert,
        # and uq_likes_song_user turned the second like away
        db.session.rollback()
        return { "errors": "User has already liked song" }, 409
    return like.to_dict()

@song_routes.route('/<int:id>/remove-like', methods=['DELETE'])
@login_required
def remove_song_like(id):
    """
    Remove a like from a selected song and return likes for the song in a list of like dictionaries
    """
    if Song.query.get(id) is None:
        return { 'errors': 'Song not found' }, 404

    like = Like.query.filter_by(song_id=id, user_id=current_user.id).first()
    if like is None:
        return { "errors": "User has not liked this song" }, 404

    db.session.delete(like)
    db.session.commit()
    return {"message": "Like successfully deleted"}



# deleting a Song
@song_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_song(id):
    selected_song = Song.query.get(id)

    if selected_song is None:
        return { 'errors': 'Song not found' }, 404

    if selected_song.to_dict()['user_id'] != current_user.id:
        return { 'errors': 'Song not found' }, 404

    song_url = selected_song.song_url

    db.session.delete(selected_song)
    db.session.commit()

    remove_file_from_s3(song_url)

    return { 'message': 'Deleted Successfully' }


# editing a Song
@song_routes.route('/<int:id>', methods=['PUT'])
@login_required
def edit_song(id):
    form = SongForm()
    form['csrf_token'].data = csrf_token_from_request()

    if form.validate_on_submit():
        current_song = Song.query.get(id)

        if current_song is None:
            return { 'errors': 'Song not found'}, 404
        elif current_song.user_id != current_user.id:
            return { 'errors': 'Song does not belong to user' }, 403

        current_song.name = form.data['name']
        current_song.track_number = form.data['track_number']

        db.session.commit()

        return jsonify(current_song.to_dict())

    return { 'errors': validation_errors_to_error_object(form.errors)}, 400
