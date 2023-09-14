from app.models import db, PlaylistSong, environment, SCHEMA
from sqlalchemy.sql import text


def seed_playlist_songs():
    playlist_song1 = PlaylistSong(
        song_id=25,
        playlist_id=1
    )
    playlist_song2 = PlaylistSong(
        song_id=17,
        playlist_id=1
    )
    playlist_song3 = PlaylistSong(
        song_id=29,
        playlist_id=2
    )
    playlist_song4 = PlaylistSong(
        song_id=24,
        playlist_id=2
    )
    playlist_song5 = PlaylistSong(
        song_id=31,
        playlist_id=3
    )
    playlist_song6 = PlaylistSong(
        song_id=30,
        playlist_id=3
    )
    playlist_song7 = PlaylistSong(
        song_id=14,
        playlist_id=4
    )
    playlist_song8 = PlaylistSong(
        song_id=22,
        playlist_id=4
    )
    playlist_song9 = PlaylistSong(
        song_id=20,
        playlist_id=5
    )
    playlist_song10 = PlaylistSong(
        song_id=10,
        playlist_id=5
    )

    db.session.add_all([playlist_song1, playlist_song2, playlist_song3, playlist_song4, playlist_song5,
                           playlist_song6, playlist_song7, playlist_song8, playlist_song9, playlist_song10])
    db.session.commit()


def undo_playlist_songs():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlist_songs"))

    db.session.commit()
