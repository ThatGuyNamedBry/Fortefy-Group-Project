from sqlalchemy.orm import joinedload, selectinload
from .db import db, environment, SCHEMA, add_prefix_for_prod, utcnow, to_iso
from .user import User

class Album(db.Model):
    __tablename__ = 'albums'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'), nullable=False)
    art = db.Column(db.String(255), default= 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Compact_Disc.jpg')
    artist = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = db.relationship('User', back_populates='albums')
    songs = db.relationship('Song', back_populates='album', cascade="all, delete")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'art': self.art,
            'artist': self.artist,
            'year': self.year,
            'genre': self.genre,
            'user': self.user.to_dict(),
            'songs': [song.to_dict() for song in self.songs],
            'created_at': to_iso(self.created_at),
            'updated_at': to_iso(self.updated_at),
        }

    @staticmethod
    def to_dict_loads():
        """
        Loader options for everything to_dict() reads, for .options(): the
        owner, and the songs with theirs. A song's album is the album being
        serialised, already in the session, so it costs no query.
        """
        # Imported here: song.py imports this module
        from .song import Song
        return (
            joinedload(Album.user),
            selectinload(Album.songs).options(joinedload(Song.user), selectinload(Song.likes)),
        )
