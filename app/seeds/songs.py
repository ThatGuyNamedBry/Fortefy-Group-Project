from app.models import db, User, environment, SCHEMA, Song
from sqlalchemy.sql import text

def seed_songs():
    song1 = Song(
        name='Song 1',
        user_id=1,
        album_id=1,
        duration=184,
        song_url='fakesongurl1',
        track_number=1
    )

    song2 = Song(
        name="Song 2",
        user_id=1,
        album_id=1,
        duration=111,
        song_url='fakesongurl2',
        track_number=2
    )

    song3 = Song(
        name="Speak to Me",
        user_id=1,
        album_id=2,
        duration=65,
        song_url='fakesongurl2',
        track_number=1
    )

    song4 = Song(
        name="Breathe (In the Air)",
        user_id=1,
        album_id=2,
        duration=169,
        song_url='fakesongurl2',
        track_number=2
    )

    song5 = Song(
        name="So Fresh So Clean",
        user_id=1,
        album_id=3,
        duration=240,
        song_url='fakesongurl2',
        track_number=1
    )

    song6 = Song(
        name="Ms. Jackson",
        user_id=1,
        album_id=3,
        duration=270,
        song_url='fakesongurl2',
        track_number=2
    )

    song7 = Song(
        name="Ronald Reagan Era",
        user_id=2,
        album_id=4,
        duration=216,
        song_url='fakesongurl2',
        track_number=1
    )

    song8 = Song(
        name="HiiiPower",
        user_id=2,
        album_id=4,
        duration=279,
        song_url='fakesongurl2',
        track_number=2
    )

    song9 = Song(
        name="Rigamortus",
        user_id=2,
        album_id=4,
        duration=168,
        song_url='fakesongurl2',
        track_number=3
    )

    song10 = Song(
        name="Bohemian Rhapsody",
        user_id=2,
        album_id=5,
        duration=355,
        song_url='fakesongurl2',
        track_number=1
    )

    song11 = Song(
        name="We Will Rock You",
        user_id=2,
        album_id=5,
        duration=121,
        song_url='fakesongurl2',
        track_number=2
    )

    song12 = Song(
        name="All of the Small Things",
        user_id=3,
        album_id=6,
        duration=171,
        song_url='fakesongurl2',
        track_number=1
    )

    song13 = Song(
        name="I Miss You",
        user_id=3,
        album_id=6,
        duration=227,
        song_url='fakesongurl2',
        track_number=2
    )

    db.session.add_all([song1, song2, song3, song4, song5, song6, song7, song8, song9, song10, song11, song12, song13])
    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
