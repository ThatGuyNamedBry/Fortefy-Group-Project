from app.models import db, User, environment, SCHEMA, Song

def seed_songs():
    song1 = Song(
        name='Song 1', user_id=1, album_id=1, duration=184
    )

    db.session.add(song1)
    db.session.commit()
