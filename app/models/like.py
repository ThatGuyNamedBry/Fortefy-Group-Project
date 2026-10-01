from .db import db, environment, SCHEMA, add_prefix_for_prod, utcnow, to_iso
from .user import User
from .song import Song

class Like(db.Model):
    __tablename__ = 'likes'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = db.relationship('User', back_populates='likes')
    song = db.relationship('Song', back_populates='likes')

    def to_dict(self):
        return {
         'id': self.id,
         'user_id': self.user_id,
         'song_id': self.song_id,
         'user': self.user.to_dict(),
         'created_at': to_iso(self.created_at),
         'updated_at': to_iso(self.updated_at),
     }

    def to_dict_brief(self):
        """
        What a song carries for each of its likes: whose it is, so the
        frontend can tell whether the current user liked the song, and its id,
        to remove it. The full to_dict() added the liker's user object and two
        timestamps to every like of every song in every list.
        """
        return {
         'id': self.id,
         'user_id': self.user_id,
     }
