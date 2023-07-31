from app.models import db, environment, SCHEMA, Album
from sqlalchemy.sql import text

def seed_albums():

    album1 = Album(
        name='The Dark Side of the Moon',
        user_id=1,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Pink+Floyd/The+Dark+Side+of+the+Moon/The+Dark+Side+of+the+Moon.jpg',
        artist='Pink Floyd',
        year=1973,
        genre='Psychedelic Rock'
    )
    album2 = Album(
        name='Stankonia',
        user_id=1,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/OutKast/Stankonia/Stankonia.jpg',
        artist='OutKast',
        year=2000,
        genre='Southern Hip Hop'
    )
    album3 = Album(
        name='Section.80',
        user_id=2,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Kendrick+Lamar/Section.80/Section.80.jpg',
        artist='Kendrick Lamar',
        year=2011,
        genre='West Coast Hip Hop'
    )
    album4 = Album(
        name="Greatest Hits",
        user_id=2,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/Queen/Greatest+Hits/Greatest+Hits.jpg',
        artist='Queen',
        year=1981,
        genre='Glam Rock'
    )
    album5 = Album(
        name="Greatest Hits",
        user_id=3,
        art='https://fortefy-song-url.s3.us-east-2.amazonaws.com/blink-182/Greatest+Hits/Greatest+Hits.jpg',
        artist='blink-182',
        year=2005,
        genre='Pop Punk'
    )


    db.session.add_all([album1, album2, album3, album4, album5])
    db.session.commit()

def undo_albums():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM albums"))

    db.session.commit()
