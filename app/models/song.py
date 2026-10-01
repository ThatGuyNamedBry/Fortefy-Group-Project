from sqlalchemy.orm import joinedload, selectinload
from .db import db, environment, SCHEMA, add_prefix_for_prod, utcnow, to_iso
from .user import User
from .album import Album

class Song(db.Model):
    __tablename__ = 'songs'

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('albums.id')), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    song_url = db.Column(db.String(255), nullable=False)
    track_number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = db.relationship('User', back_populates='songs')
    album = db.relationship('Album', back_populates='songs')
    likes = db.relationship('Like', back_populates='song', cascade="all, delete")
    playlist_songs = db.relationship('PlaylistSong', back_populates='song', cascade="all, delete")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'album_id': self.album_id,
            'duration': self.duration,
            'user': self.user.to_dict(),
            'likes': [like.to_dict_brief() for like in self.likes],
            'song_url': self.song_url,
            'track_number': self.track_number,
            'artist': self.album.artist,
            'album_name': self.album.name,
            "album_art": self.album.art,
            'created_at': to_iso(self.created_at),
            'updated_at': to_iso(self.updated_at),
        }

    @staticmethod
    def to_dict_loads():
        """
        Loader options for everything to_dict() reads, for .options(). Without
        them each song lazily loads its user, album and likes one query at a
        time, so a list of songs cost about three queries per song.
        """
        return (joinedload(Song.user), joinedload(Song.album), selectinload(Song.likes))

    def to_dict_likes(self):
        return {
            # 'id': self.id,
            # 'name': self.name,
            # 'user_id': self.user_id,
            # 'album_id': self.album_id,
            # 'duration': self.duration,
            # 'user': self.user.to_dict(),
            'likes': self.likes,
        }
