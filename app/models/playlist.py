from .db import db, environment, SCHEMA, add_prefix_for_prod
from .user import User

class Playlist(db.Model):
    __tablename__ = 'playlists'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    title = db.Column(db.String, nullable=False)
    art = db.Column(db.String, default= '')
    description = db.Column(db.String)

    user = db.relationship('User', back_populates='playlists')
    playlist_songs = db.relationship('PlaylistSong', back_populates='playlist')

    def to_dict(self):
        return {
         'id': self.id,
         'user_id': self.user_id,
         'title': self.title,
         'art': self.art,
         'description': self.description,
         'user': self.user.to_dict(),
         'playlist_songs': [playlist_song.to_dict() for playlist_song in self.playlist_songs]
     }
