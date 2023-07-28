from .db import db, environment, SCHEMA, add_prefix_for_prod
from .user import User
from .song import Song
from .playlist import Playlist
from datetime import datetime

class PlaylistSong(db.Model):
    __tablename__= 'playlist_songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    songId = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False)
    playlistId = db.Column(db.Integer, db.ForeignKey('playlists.id'), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.now())
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.now())

    song = db.relationship('Song', back_populates='playlist_songs')
    playlist = db.relationship('Playlist', back_populates='playlist_songs')
