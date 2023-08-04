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
    album6 = Album(
        name="Stranger in the Alps",
        user_id=3,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Phoebe+Bridgers/Stranger+in+the+Alps/Stranger+in+the+Alps.jpg",
        artist='Phoebe Bridgers',
        year=2017,
        genre='Indie Folk'
    )
    album7 = Album(
        name="Rumours",
        user_id=4,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Fleetwood+Mac/Rumours/Rumours.jpg",
        artist='Fleetwood Mac',
        year=1977,
        genre='Pop Rock'
    )
    album8 = Album(
        name="Renaissance",
        user_id=4,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Beyonc%C3%A9/Renaissance/Renaissance.jpg",
        artist='Beyoncé',
        year=2022,
        genre='Alternative R&B'
    )
    album9 = Album(
        name="Somethin' Else",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Cannonball+Adderley/Somethin'+Else/Somethin'+Else.jpg",
        artist='Cannonball Adderley',
        year=1958,
        genre='Hard Bop'
    )
    album10 = Album(
        name="Whitney",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Whitney+Houston/Whitney/Whitney.jpg",
        artist='Whitney Houston',
        year=1987,
        genre='Dance Pop'
    )
    album11 = Album(
        name="Selected Ambient Works 85-92",
        user_id=5,
        art="https://fortefy-song-url.s3.us-east-2.amazonaws.com/Aphex+Twin/Selected+Ambient+Works+85-92/Selected+Ambient+Works+85-92.jpg",
        artist='Aphex Twin',
        year=1992,
        genre='IDM'
    )

    db.session.add_all([album1, album2, album3, album4, album5, album6, album7, album8, album9, album10, album11])
    db.session.commit()

def undo_albums():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM albums"))

    db.session.commit()
