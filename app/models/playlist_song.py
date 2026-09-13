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
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')), nullable=False)
    playlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('playlists.id')), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    song= db.relationship('Song', back_populates='playlist_songs')
    playlist = db.relationship('Playlist', back_populates='playlist_songs')

    def to_dict(self):
        return {
         'id': self.id,
         'song_id': self.song_id,
         'playlist_id': self.playlist_id,
         'song': self.song.to_dict(),
         'created_at': self.created_at.isoformat() if self.created_at else None,
         'updated_at': self.updated_at.isoformat() if self.updated_at else None,
     }
