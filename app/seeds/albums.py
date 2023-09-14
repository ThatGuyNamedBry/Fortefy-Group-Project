from app.models import db, environment, SCHEMA, Album
from sqlalchemy.sql import text

def seed_albums():

    album1 = Album(
        name='Polygondwanaland',
        user_id=1,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Polygondwanaland.jpg',
        artist='King Gizzard and the Lizard Wizard',
        year=2017,
        genre='Progressive Rock'
    )
    album2 = Album(
        name="Dazed and Confused",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Razors/Dazed+and+Confused/Dazed+and+Confused.jpg",
        artist='The Razors',
        year=1975,
        genre='Funk'
    )
    album3 = Album(
        name='Indestructable Sun',
        user_id=2,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Elixir/Indestructable+Sun/Indestructable+Sun.jpg',
        artist='Elixir',
        year=2011,
        genre='Afrobeat'
    )
    album4 = Album(
        name="Roadhouse",
        user_id=2,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Glass+Suburban/Roadhouse/Roadhouse.jpg',
        artist='Glass Suburban',
        year=2013,
        genre='Rock'
    )
    album5 = Album(
        name="Ganges",
        user_id=3,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Prashant+Bidkar/Ganges/Ganges.jpg",
        artist='Prashant Bidkar',
        year=2017,
        genre='Instrumental Hip Hop'
    )
    album6 = Album(
        name="El corazón",
        user_id=4,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Rosa+de+Torres/El+corazo%CC%81n/El+corazo%CC%81n.jpg",
        artist='Rosa de Torres',
        year=2009,
        genre='Flamenco'
    )
    album7 = Album(
        name="Things Gonna Change",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Climbers/Things+Gonna+Change/Things+Gonna+Change.jpg",
        artist='The Climbers',
        year=1978,
        genre='Reggae'
    )
    album8 = Album(
        name="Blue Moods",
        user_id=4,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Dylan+Grelli+Band/Blue+Moods/Blue+Moods.jpg",
        artist='The Dylan Grelli Band',
        year=2011,
        genre='Jazz'
    )
    album9 = Album(
        name="The Heapin' Helpins",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Heapin'+Helpins/The+Heapin'+Helpins/The+Heapin'+Helpins.jpg",
        artist="The Heapin' Helpins",
        year=2014,
        genre='Bluegrass'
    )
    album10 = Album(
        name='Mimic Harbor',
        user_id=1,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/Deep+Owls/Mimic+Harbor/Mimic+Harbor.jpg',
        artist='Deep Owls',
        year=2021,
        genre='Electronic'
    )


    db.session.add_all([album1, album2, album3, album4, album5, album6, album7, album8, album9, album10])
    db.session.commit()

def undo_albums():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM albums"))

    db.session.commit()
