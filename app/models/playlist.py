from sqlalchemy.orm import joinedload, selectinload
from .db import db, environment, SCHEMA, add_prefix_for_prod, utcnow, to_iso


class Playlist(db.Model):
    __tablename__ = 'playlists'

    if environment == 'production':
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'),
        nullable=False,
    )
    title = db.Column(db.String, nullable=False)
    # NULL when there is no art; the client shows the first song's cover, or
    # its own default
    art = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = db.relationship('User', back_populates='playlists')
    # In the order they were added. Without an ORDER BY the database may hand
    # them back in any order it likes; Postgres does not promise insertion order.
    playlist_songs = db.relationship(
        'PlaylistSong', back_populates='playlist', cascade='all, delete', order_by='PlaylistSong.id'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'art': self.art,
            'description': self.description,
            'user': self.user.to_dict(),
            'playlist_songs': [playlist_song.to_dict() for playlist_song in self.playlist_songs],
            'created_at': to_iso(self.created_at),
            'updated_at': to_iso(self.updated_at),
        }

    @staticmethod
    def to_dict_loads():
        """
        Loader options for everything to_dict() reads, for .options(): the
        owner, and each entry's song with everything the song serialises
        """
        # Imported here: both modules import this one
        from .playlist_song import PlaylistSong
        from .song import Song

        return (
            joinedload(Playlist.user),
            selectinload(Playlist.playlist_songs)
            .joinedload(PlaylistSong.song)
            .options(*Song.to_dict_loads()),
        )
