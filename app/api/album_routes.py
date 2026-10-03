from flask import Blueprint, jsonify, current_app
from flask_login import login_required, current_user
from app.models import Album, db, Song
from app.forms import AlbumForm, CreateSongForm
from app.api.auth_routes import validation_errors_to_error_object
from app.api.aws_helper import get_unique_filename, upload_file_to_s3, remove_file_from_s3
from app.api.csrf import csrf_token_from_request
from mutagen import MutagenError
from mutagen.mp3 import MP3
from mutagen.mp4 import MP4
from mutagen.wave import WAVE

album_routes = Blueprint('albums', __name__)

# The mutagen reader for each extension CreateSongForm accepts
# (ALLOWED_EXTENSIONS). mutagen.File() would have to guess the format from the
# file's name and first bytes, and an upload's name never reaches it: it
# returns None for a real WAV, and for an MP3 without an ID3 tag.
AUDIO_READERS = {'mp3': MP3, 'm4a': MP4, 'wav': WAVE}

@album_routes.route('')
def get_all_albums():
    """
    Query for all albums and returns them in a list of album dictionaries
    """
    albums = Album.query.options(*Album.to_dict_loads()).all()
    return jsonify([album.to_dict() for album in albums])


@album_routes.route('/<int:id>')
def get_album_by_id(id):
    """
    Query for an album by id and returns that album in a dictionary
    """
    album = Album.query.options(*Album.to_dict_loads()).get(id)

    if album is None:
        return { 'errors': 'Album not found' }, 404

    return jsonify(album.to_dict())


@album_routes.route('/current')
@login_required
def get_user_albums():
    """
    Query for all albums created by the current user and return them in a list of album dictionaries
    """
    user_albums = Album.query.options(*Album.to_dict_loads()).filter(Album.user_id == current_user.id)
    albums_dict = [album.to_dict() for album in user_albums]
    return jsonify(albums_dict)


# Deleting an Album created by the user
@album_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_album(id):
    album = Album.query.get(id)

    if album is None or album.user_id != current_user.id:
        return {'errors': 'Album not found'}, 404

    # Below the check, not above it: reading songs off a missing album was
    # raising first, so the check under it could never run
    song_urls = [song.song_url for song in album.songs]

    db.session.delete(album)
    db.session.commit()

    for song_url in song_urls:
        remove_file_from_s3(song_url)

    return { 'message': 'Successfully Deleted'}


# Creating a new Album
@album_routes.route('/newAlbum', methods=['POST'])
@login_required
def create_new_album():
    form = AlbumForm()
    form['csrf_token'].data = csrf_token_from_request()

    if form.validate_on_submit():

        new_album = Album (
            user_id = current_user.id,
            name = form.data['name'],
            art = form.data['art'] or None,
            artist = form.data['artist'],
            year = form.data['year'],
            genre = form.data['genre']
        )

        db.session.add(new_album)
        db.session.commit()

        return jsonify(new_album.to_dict())

    return { 'errors': validation_errors_to_error_object(form.errors) }, 400


# Create a Song for an album
@album_routes.route('/<int:id>/song', methods=['POST'])
@login_required
def create_album_song(id):

    form = CreateSongForm()
    form['csrf_token'].data = csrf_token_from_request()

    if form.validate_on_submit():
        album = Album.query.get(id)

        if album is None or album.user_id != current_user.id:
            return { 'errors': 'Album not found'}, 404

        song = form.data['song']
        extension = song.filename.rsplit('.', 1)[1].lower()

        # The form only checked the name. A file whose contents are not the
        # format its extension claims used to crash here with a 500
        try:
            audio = AUDIO_READERS[extension](song)
            playable = audio.info.length > 0
        except MutagenError:
            playable = False
        if not playable:
            return { 'errors': { 'song': f'File is not a playable .{extension} file' } }, 400

        song.filename = get_unique_filename(song.filename)
        song.seek(0)
        upload = upload_file_to_s3(song)

        # boto3's reason (bad credentials, missing bucket, no network) is for
        # the logs; the browser only needs to know the file was not stored
        if 'url' not in upload:
            current_app.logger.error('Song upload to S3 failed: %s', upload['errors'])
            return { 'errors': { 'song': 'The file could not be stored. Please try again later.' } }, 502

        newSong = Song (
            name = form.data['name'],
            track_number = form.data['track_number'],
            song_url = upload['url'],
            user_id = album.user_id,
            album_id = album.id,
            # mutagen measures in fractional seconds; the column holds whole ones
            duration = round(audio.info.length)
        )

        db.session.add(newSong)
        db.session.commit()

        return jsonify(newSong.to_dict())

    return { 'errors': validation_errors_to_error_object(form.errors)}, 400


# Editing an Album a user already created
@album_routes.route('/edit/<int:id>', methods=['PUT'])
@login_required
def edit_album(id):
    form = AlbumForm()
    form['csrf_token'].data = csrf_token_from_request()

    if form.validate_on_submit():
        album = Album.query.get(id)

        if album is None or album.user_id != current_user.id:
            return { 'errors': 'Album not found'}, 404

        album.name = form.data['name']
        album.artist = form.data['artist']
        album.year = form.data['year']
        album.genre = form.data['genre']
        album.art = form.data['art'] or None

        db.session.commit()

        return jsonify(album.to_dict())

    return { 'errors': validation_errors_to_error_object(form.errors) }, 400
