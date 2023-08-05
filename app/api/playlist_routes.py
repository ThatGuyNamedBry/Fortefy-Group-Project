from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Playlist, PlaylistSong
from app.forms import CreatePlaylistForm, EditPlaylistForm
from app.api.auth_routes import validation_errors_to_error_messages

playlist_routes = Blueprint('playlists', __name__)

# Get All Playlists
@playlist_routes.route('')
def get_all_playlists():
    """
    Query for all playlists and returns them in a list of playlist dictionaries
    """
    playlists = [playlist.to_dict() for playlist in Playlist.query.all()]
    return jsonify(playlists)


# Get All User-Created Playlists
@playlist_routes.route('/current')
@login_required
def get_user_playlists():
    """
    Query for all playlists created by the current user and return them in a list of playlist dictionaries
    """
    user_playlists = Playlist.query.filter(Playlist.user_id == current_user.id)
    playlists_dict = [playlist.to_dict() for playlist in user_playlists]
    return jsonify(playlists_dict)

# Create a New Playlist
@playlist_routes.route('/new', methods=['POST'])
@login_required
def create_new_playlist():
    form = CreatePlaylistForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        new_playlist = Playlist(
            user_id = current_user.id,
            title = form.data['title'],
            art = form.data['art'],
            description = form.data['description']
        )

        db.session.add(new_playlist)
        db.session.commit()
        return jsonify(new_playlist.to_dict())

    # print(validation_errors_to_error_messages(form.errors))
    return { 'errors': validation_errors_to_error_messages(form.errors)}, 400

# Add a Song to a Playlist with Playlist Id and **SONG** ID
@playlist_routes.route('/<int:playlist_id>/playlist-songs/<int:song_id>/new', methods=['PUT'])
@login_required
def add_playlist_song(playlist_id, song_id):
    """
    Create a playlist_song instance and return the altered playlist as a dictionary
    """
    playlist_song = PlaylistSong(
        song_id = song_id,
        playlist_id = playlist_id
    )

    updated_playlist = Playlist.query.get(playlist_id)
    if updated_playlist is None:
        return {"errors": "Playlist could not be found"}, 404

    db.session.add(playlist_song)
    db.session.commit()

    return jsonify(updated_playlist.to_dict())

# Remove a Song from a Playlist By **PLAYLISTSONG** ID
@playlist_routes.route('/<int:playlist_id>/playlist-songs/<int:playlist_song_id>/delete', methods=['PUT'])
@login_required
def remove_playlist_song(playlist_id, playlist_song_id):
    """Query for a playlist_song by it's playlist_song_id, delete it from the db and return the altered playlist as a dictionary"""
    playlist_song = PlaylistSong.query.get(playlist_song_id)

    if playlist_song is None:
        return {"errors": "Song cannot be found in Playlist"}, 404

    db.session.delete(playlist_song)
    db.session.commit()

    updated_playlist = Playlist.query.get(playlist_id)

    return jsonify(updated_playlist.to_dict())

# Edit a User-Created Playlist
@playlist_routes.route('/<int:id>/edit', methods=['PUT'])
@login_required
def edit_playlist(id):
    form = EditPlaylistForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        playlist = Playlist.query.get(id)

        if playlist is None:
            return { 'errors': 'Playlist not found'}, 404
        elif playlist.user_id != current_user.id:
            return { 'errors': 'Playlist does not belong to user' }, 403

        playlist.title = form.data['title']
        playlist.art = form.data['art']
        playlist.description = form.data['description']

        db.session.commit()

        return jsonify(playlist.to_dict())
    return { 'errors': validation_errors_to_error_messages(form.errors) }, 400

# Delete a Playlist By Id
@playlist_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_playlist(id):
    playlist = Playlist.query.get(id)

    if playlist is None:
        return {'errors': 'Playlist not found'}, 404
    elif playlist.user_id != current_user.id:
        return {"errors": "Playlist does not belong to user"}, 403

    db.session.delete(playlist)
    db.session.commit()
    return {'message': 'Successfully Deleted'}


# Get a Playlist By Id
@playlist_routes.route('/<int:id>')
def get_playlist_by_id(id):
    """
    Query for a playlist by id and returns that playlist in a dictionary
    """
    playlist = Playlist.query.get(id)
    return jsonify(playlist.to_dict())
