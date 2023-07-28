from .db import db, environment, SCHEMA, add_prefix_for_prod
from .user import User

class Playlist(db.Model):
    __tablename__ = 'playlists'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    art = db.Column(db.String, default= '')
    description = db.Column(db.String)

    user = db.relationship('User', back_populates='playlists')
    playlist_songs = db.relationship('PlaylistSong', back_populates='playlist')
