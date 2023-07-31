from app.models import db, User, environment, SCHEMA, Song
from sqlalchemy.sql import text

def seed_songs():

    song1 = Song(
        name="Speak to Me",
        user_id=1,
        album_id=1,
        duration=65,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Pink+Floyd/The+Dark+Side+of+the+Moon/Speak+to+Me.mp3',
        track_number=1
    )

    song2 = Song(
        name="Breathe (In the Air)",
        user_id=1,
        album_id=1,
        duration=169,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Pink+Floyd/The+Dark+Side+of+the+Moon/Breathe+(In+the+Air).mp3',
        track_number=2
    )

    song3 = Song(
        name="So Fresh So Clean",
        user_id=1,
        album_id=2,
        duration=240,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/OutKast/Stankonia/So+Fresh%2C+So+Clean.mp3',
        track_number=4
    )

    song4 = Song(
        name="Ms. Jackson",
        user_id=1,
        album_id=2,
        duration=270,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/OutKast/Stankonia/Ms.+Jackson.mp3',
        track_number=5
    )

    song5 = Song(
        name="Ronald Reagan Era (His Evils)",
        user_id=2,
        album_id=3,
        duration=216,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Kendrick+Lamar/Section.80/Ronald+Reagan+Era+(His+Evils).mp3',
        track_number=7
    )

    song6 = Song(
        name="HiiiPoWeR",
        user_id=2,
        album_id=3,
        duration=279,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Kendrick+Lamar/Section.80/HiiiPoWeR.mp3',
        track_number=16
    )

    song7 = Song(
        name="Rigamortis",
        user_id=2,
        album_id=3,
        duration=168,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Kendrick+Lamar/Section.80/Rigamortis.mp3',
        track_number=12
    )

    song8 = Song(
        name="Bohemian Rhapsody",
        user_id=2,
        album_id=4,
        duration=355,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Queen/Greatest+Hits/Bohemian+Rhapsody.mp3',
        track_number=1
    )

    song9 = Song(
        name="We Will Rock You",
        user_id=2,
        album_id=4,
        duration=121,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Queen/Greatest+Hits/We+Will+Rock+You.mp3',
        track_number=16
    )

    song10 = Song(
        name="All the Small Things",
        user_id=3,
        album_id=5,
        duration=171,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/blink-182/Greatest+Hits/All+the+Small+Things.mp3',
        track_number=6
    )

    song11 = Song(
        name="I Miss You",
        user_id=3,
        album_id=5,
        duration=227,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/blink-182/Greatest+Hits/I+Miss+You.mp3',
        track_number=13
    )

    db.session.add_all([song1, song2, song3, song4, song5, song6, song7, song8, song9, song10, song11])
    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
