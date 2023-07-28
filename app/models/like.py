from .db import db, environment, SCHEMA, add_prefix_for_prod
from .user import User
from .song import Song

class Like(db.Model):
    __tablename__ = 'likes'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='likes')
    song = db.relationship('Song', back_populates='likes')

    def to_dict(self):
        return {
         'id': self.id,
         'user_id': self.user_id,
         'song_id': self.song_id,
         'user': self.user.to_dict(),
     }
