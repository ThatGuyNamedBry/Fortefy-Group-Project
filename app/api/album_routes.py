from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import Album, db, Song
from app.forms import CreateAlbumForm, EditAlbumForm, CreateSongForm
from app.api.auth_routes import validation_errors_to_error_messages
from app.api.aws_helper import get_unique_filename, upload_file_to_s3
from mutagen.mp3 import MP3

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
@login_required
def get_user_albums():
    """
    Query for all albums created by the current user and return them in a list of album dictionaries
    """
    user_albums = Album.query.filter(Album.user_id == current_user.id)
    albums_dict = [album.to_dict() for album in user_albums]
    return jsonify(albums_dict)


# Deleting an Album created by the user
@album_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_album(id):
    album = Album.query.get(id)

    if album is None or album.user_id != current_user.id:
        return {'errors': 'Album not found'}, 404

    db.session.delete(album)
    db.session.commit()

    return { 'message': 'Successfully Deleted'}


# Creating a new Album
@album_routes.route('/newAlbum', methods=['POST'])
@login_required
def create_new_album():
    form = CreateAlbumForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    form.data['user_id'] = current_user.id
    if form.validate_on_submit():

        new_album = Album (
            user_id = current_user.id,
            name = form.data['name'],
            art = form.data['art'],
            artist = form.data['artist'],
            year = form.data['year'],
            genre = form.data['genre']
        )

        db.session.add(new_album)
        db.session.commit()

        return jsonify(new_album.to_dict())

    return { 'errors': validation_errors_to_error_messages(form.errors) }, 400


# Create a Song for an album
@album_routes.route('/<int:id>/song', methods=['POST'])
@login_required
def create_album_song(id):

    form = CreateSongForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    print('form data:', form.data)

    if form.validate_on_submit():
        album = Album.query.get(id)

        if album is None or album.user_id != current_user.id:
            return { 'errors': 'Album not found'}, 404

        song = form.data['song']
        audio = MP3(song)
        song.filename = get_unique_filename(song.filename)
        upload = upload_file_to_s3(song)


        if 'url' not in upload:
            return { 'errors': 'upload error'}

        newSong = Song (
            name = form.data['name'],
            track_number = form.data['track_number'],
            song_url = upload['url'],
            user_id = album.user_id,
            album_id = album.id,
            duration = audio.info.length
        )

        db.session.add(newSong)
        db.session.commit()

        return jsonify(newSong.to_dict())

    print(validation_errors_to_error_messages(form.errors))
    return { 'errors': validation_errors_to_error_messages(form.errors)}, 400


# Editing an Album a user already created
@album_routes.route('/edit/<int:id>', methods=['PUT'])
@login_required
def edit_album(id):
    form = EditAlbumForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        album = Album.query.get(id)

        if album is None or album.user_id != current_user.id:
            return { 'errors': 'Album not found'}, 404

        album.name = form.data['name']
        album.art = form.data['art']
        album.artist = form.data['artist']
        album.year = form.data['year']
        album.genre = form.data['genre']

        db.session.commit()

        return jsonify(album.to_dict())

    return { 'errors': validation_errors_to_error_messages(form.errors) }, 400
