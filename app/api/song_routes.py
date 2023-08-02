from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Song, Like
from app.forms import EditSongForm
from app.api.aws_helper import get_unique_filename, upload_file_to_s3
from app.api.auth_routes import validation_errors_to_error_messages

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

@song_routes.route("/<int:id>/likes")
@login_required
def get_song_likes(id):
    """
    Query for a song by id and return a list of like dictionaries for that song
    """
    song_likes = Song.query.get(id).to_dict()["likes"]
    return jsonify(song_likes)

@song_routes.route('/<int:id>/add-like', methods=['POST'])
@login_required
def add_song_like(id):
    """
    Add a like to a selected song and return likes for the song in a list of like dictionaries
    """
    song = Song.query.get(id).to_dict()
    # If song already has user's like, return error
    for like in song["likes"]:
        if like["user_id"] == current_user.id:
            return { "errors": "User has already liked song" }, 405

    # Else create and add new like to song
    like = Like(
        song_id=id,
        user_id=current_user.id
    )

    db.session.add(like)
    db.session.commit()
    return like.to_dict()

@song_routes.route('/<int:id>/remove-like', methods=['DELETE'])
@login_required
def remove_song_like(id):
    """
    Remove a like from a selected song and return likes for the song in a list of like dictionaries
    """
    song = Song.query.get(id)

    # Iterate through list of like dictionaries which CANNOT be deleted from the db
    ind = 0
    for like in song.to_dict()["likes"]:
        # find user's like, and ind will now equal it's index in the list
        if like["user_id"] == current_user.id:
            # use **to_dict_likes** method to get a list of like INSTANCES that CAN be deleted from the db
            delete_like = song.to_dict_likes()["likes"][ind]
            # use corresponding index to delete the like instance from db
            db.session.delete(delete_like)
            db.session.commit()
            return {"message": "Like successfully deleted"}
        ind += 1

    return { "errors": "User has not liked this song" }, 405



# deleting a Song
@song_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_song(id):
    selected_song = Song.query.get(id)

    if selected_song.to_dict()['user_id'] != current_user.id:
        return { 'errors': 'Song not found' }, 404

    db.session.delete(selected_song)
    db.session.commit()

    return { 'message': 'Deleted Successfully' }


# editing a Song
@song_routes.route('/edit/<int:id>', methods=['PUT'])
@login_required
def edit_song(id):
    form = EditSongForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        current_song = Song.query.get(id)

        if form.data['song'] is not None:
            new_song = form.data['song']
            new_song.filename = get_unique_filename(new_song.filename)
            upload = upload_file_to_s3(new_song)

            if 'url' not in upload:
                return { 'error': 'upload error'}

            current_song.song_url = upload['url']

        current_song.name = form.data['name']
        current_song.track_number = form.data['track_number']

        db.session.commit()

        return jsonify(current_song.to_dict())

    return { 'errors': validation_errors_to_error_messages(form.errors)}, 401
