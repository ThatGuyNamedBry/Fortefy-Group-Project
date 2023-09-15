from app.models import db, User, environment, SCHEMA, Song
from sqlalchemy.sql import text

def seed_songs():
# Polygondwanaland
    song1 = Song(
        name="Crumbling Castle",
        user_id=1,
        album_id=1,
        duration=644,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Crumbling+Castle.mp3',
        track_number=1
    )
    song2 = Song(
        name="Polygondwanaland",
        user_id=1,
        album_id=1,
        duration=213,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Polygondwanaland.mp3',
        track_number=2
    )
    song3 = Song(
        name="The Castle In The Air",
        user_id=1,
        album_id=1,
        duration=168,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/The+Castle+In+The+Air.mp3',
        track_number=3
    )
    song4 = Song(
        name="Deserted Dunes Welcome Weary Feet",
        user_id=1,
        album_id=1,
        duration=214,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Deserted+Dunes+Welcome+Weary+Feet.mp3',
        track_number=4
    )
    song5 = Song(
        name="Inner Cell",
        user_id=1,
        album_id=1,
        duration=236,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Inner+Cell.mp3',
        track_number=5
    )
    song6 = Song(
        name="Loyalty",
        user_id=1,
        album_id=1,
        duration=219,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Loyalty.mp3',
        track_number=6
    )
    song7 = Song(
        name="Horology",
        user_id=1,
        album_id=1,
        duration=172,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Horology.mp3',
        track_number=7
    )
    song8 = Song(
        name="Tetrachromacy",
        user_id=1,
        album_id=1,
        duration=211,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Tetrachromacy.mp3',
        track_number=8
    )
    song9 = Song(
        name="Searching...",
        user_id=1,
        album_id=1,
        duration=184,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Searching....mp3',
        track_number=9
    )
    song10 = Song(
        name="The Fourth Colour",
        user_id=1,
        album_id=1,
        duration=372,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/The+Fourth+Colour.mp3',
        track_number=10
    )
# Mimic Harbor
    song11 = Song(
        name="Future Times",
        user_id=1,
        album_id=10,
        duration=111,
        song_url='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Future+Times.mp3',
        track_number=1
    )
    song12 = Song(
        name="I Wanna Feel",
        user_id=1,
        album_id=10,
        duration=146,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/I+Wanna+Feel.mp3",
        track_number=2
    )
    song13 = Song(
        name="Into the Night",
        user_id=1,
        album_id=10,
        duration=141,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Into+the+Night.mp3",
        track_number=3
    )
    song14 = Song(
        name="Nightshades",
        user_id=1,
        album_id=10,
        duration=126,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Nightshades.mp3",
        track_number=4
    )
    song15 = Song(
        name="Points of Egress",
        user_id=1,
        album_id=10,
        duration=149,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Points+of+Egress.mp3",
        track_number=5
    )
    song16 = Song(
        name="Rise Over Run",
        user_id=1,
        album_id=10,
        duration=68,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Rise+Over+Run.mp3",
        track_number=6
    )
# Indestructable Sun
    song17 = Song(
        name="Indestructable Sun",
        user_id=1,
        album_id=3,
        duration=104,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Elixir/Indestructable+Sun/Indestructable+Sun.mp3",
        track_number=1
    )
    song18 = Song(
        name="Maasai",
        user_id=1,
        album_id=3,
        duration=165,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Elixir/Indestructable+Sun/Maasai.mp3",
        track_number=2
    )
# Roadhouse
    song19 = Song(
        name="Getting There",
        user_id=1,
        album_id=4,
        duration=129,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Glass+Suburban/Roadhouse/Getting+There.mp3",
        track_number=1
    )
    song20 = Song(
        name="King Around Here",
        user_id=1,
        album_id=4,
        duration=111,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Glass+Suburban/Roadhouse/King+Around+Here.mp3",
        track_number=2
    )
    song21 = Song(
        name="Rock It",
        user_id=1,
        album_id=4,
        duration=93,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Glass+Suburban/Roadhouse/Rock+It.mp3",
        track_number=3
    )
# Ganges
    song22 = Song(
        name="Devolving",
        user_id=1,
        album_id=5,
        duration=90,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Prashant+Bidkar/Ganges/Devolving.mp3",
        track_number=1
    )
    song23 = Song(
        name="Mountainous",
        user_id=1,
        album_id=5,
        duration=125,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Prashant+Bidkar/Ganges/Mountainous.mp3",
        track_number=2
    )
# El corazón
    song24 = Song(
        name="Solera",
        user_id=1,
        album_id=6,
        duration=214,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Rosa+de+Torres/El+corazo%CC%81n/Solera.mp3",
        track_number=1
    )
# Things Gonna Change
    song25 = Song(
        name="She's Coming to Town",
        user_id=1,
        album_id=7,
        duration=144,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Climbers/Things+Gonna+Change/She's+Coming+to+Town.mp3",
        track_number=1
    )
    song26 = Song(
        name="Things Gonna Change",
        user_id=1,
        album_id=7,
        duration=203,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Climbers/Things+Gonna+Change/Things+Gonna+Change.mp3",
        track_number=2
    )
# Blue Moods
    song27 = Song(
        name="Closer",
        user_id=2,
        album_id=8,
        duration=229,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Dylan+Grelli+Band/Blue+Moods/Closer.mp3",
        track_number=1
    )
    song28 = Song(
        name="Grace's Song",
        user_id=2,
        album_id=8,
        duration=77,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Dylan+Grelli+Band/Blue+Moods/Grace's+Song.mp3",
        track_number=2
    )
    song29 = Song(
        name="La promenade",
        user_id=2,
        album_id=8,
        duration=105,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Dylan+Grelli+Band/Blue+Moods/La+promenade.mp3",
        track_number=3
    )
# The Heapin' Helpins
    song30 = Song(
        name="Pickin' Party",
        user_id=3,
        album_id=9,
        duration=181,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Heapin'+Helpins/The+Heapin'+Helpins/Pickin'+Party.mp3",
        track_number=1
    )
# Dazed and Confused
    song31 = Song(
        name="Get Down",
        user_id=3,
        album_id=2,
        duration=144,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Razors/Dazed+and+Confused/Get+Down.mp3",
        track_number=1
    )
    song32 = Song(
        name="Get Up",
        user_id=3,
        album_id=2,
        duration=208,
        song_url="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Razors/Dazed+and+Confused/Get+Up.mp3",
        track_number=2
    )


    db.session.add_all([song1, song2, song3, song4, song5, song6, song7, song8, song9, song10,
                        song11, song12, song13, song14, song15, song16, song17, song18, song19, song20,
                        song21, song22, song23, song24, song25, song26, song27, song28, song29,
                        song30, song31, song32
                        ])
    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
