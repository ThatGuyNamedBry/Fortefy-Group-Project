from app.models import db, PlaylistSong, environment, SCHEMA
from sqlalchemy.sql import text

def seed_playlist_songs():
    playlist_song1 = PlaylistSong(
        song_id=1,
        playlist_id=1
    )

    playlist_song2 = PlaylistSong(
        song_id=2,
        playlist_id=1
    )

    _ = db.session.add_all([playlist_song1, playlist_song2])
    db.session.commit()

def undo_playlist_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlist_songs"))

    db.session.commit()
