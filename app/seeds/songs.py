from app.models import db, environment, SCHEMA, Song
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
    song12 = Song(
        name="Smoke Signals",
        user_id=3,
        album_id=6,
        duration=325,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Phoebe+Bridgers/Stranger+in+the+Alps/Smoke+Signals.mp3",
        track_number=1
    )
    song13 = Song(
        name="Motion Sickness",
        user_id=3,
        album_id=6,
        duration=230,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Phoebe+Bridgers/Stranger+in+the+Alps/Motion+Sickness.mp3",
        track_number=2
    )
    song14 = Song(
        name="Funeral",
        user_id=3,
        album_id=6,
        duration=232,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Phoebe+Bridgers/Stranger+in+the+Alps/Funeral.mp3",
        track_number=3
    )
    song15 = Song(
        name="Dreams",
        user_id=4,
        album_id=7,
        duration=254,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Fleetwood+Mac/Rumours/Dreams.mp3",
        track_number=2
    )
    song16 = Song(
        name="The Chain",
        user_id=4,
        album_id=7,
        duration=268,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Fleetwood+Mac/Rumours/The+Chain.mp3",
        track_number=7
    )
    song17 = Song(
        name="Break My Soul",
        user_id=4,
        album_id=8,
        duration=278,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Beyonc%C3%A9/Renaissance/BREAK+MY+SOUL.mp3",
        track_number=6
    )
    song18 = Song(
        name="Autumn Leaves",
        user_id=5,
        album_id=9,
        duration=661,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Cannonball+Adderley/Somethin'+Else/Autumn+Leaves.mp3",
        track_number=1
    )
    song19 = Song(
        name="I Wanna Dance With Somebody (Who Loves Me)",
        user_id=5,
        album_id=10,
        duration=290,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Whitney+Houston/Whitney/I+Wanna+Dance+With+Somebody+(Who+Loves+Me).mp3",
        track_number=1
    )
    song20 = Song(
        name="Xtal",
        user_id=5,
        album_id=11,
        duration=294,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Aphex+Twin/Selected+Ambient+Works+85-92/Xtal.mp3",
        track_number=1
    )

    db.session.add_all([song1, song2, song3, song4, song5, song6, song7, song8, song9, song10, song11, song12, song13, song14, song15, song16, song17, song18, song19, song20])
    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
