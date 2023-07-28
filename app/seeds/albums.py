from app.models import db, environment, SCHEMA, Album
from sqlalchemy.sql import text

def seed_albums():
    album1 = Album(
        name='Album 1',
        user_id=1,
        art='https://upload.wikimedia.org/wikipedia/commons/e/ed/Compact_Disc.jpg',
        artist='Artist 1',
        year=2023,
        genre='Rock'
    )

    album2 = Album(
        name='Dark Side of the Moon',
        user_id=1,
        art='https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
        artist='Pink Floyd',
        year=1973,
        genre='Rock'
    )
    album3 = Album(
        name='Stankonia',
        user_id=1,
        art='https://upload.wikimedia.org/wikipedia/en/0/0b/OutKast_-_Stankonia.JPG',
        artist='OutKast',
        year=2000,
        genre='Rap'
    )
    album4 = Album(
        name='Section.80',
        user_id=2,
        art='https://i.redd.it/uko5illmwhx01.jpg',
        artist='Kendrick Lamar',
        year=2011,
        genre='Rap'
    )
    album5 = Album(
        name="Queen's Greatest Hits",
        user_id=2,
        art='https://upload.wikimedia.org/wikipedia/en/0/02/Queen_Greatest_Hits.png',
        artist='Queen',
        year=1981,
        genre='Rock'
    )
    album6 = Album(
        name="Blink 182's Greatest Hits",
        user_id=3,
        art='https://m.media-amazon.com/images/M/MV5BMTMwMjI3NjU4OV5BMl5BanBnXkFtZTcwNzQxNjM0Mg@@._V1_FMjpg_UX1000_.jpg',
        artist='Blink 182',
        year=2005,
        genre='Rock'
    )


    db.session.add_all([album1, album2, album3, album4, album5, album6])
    db.session.commit()

def undo_albums():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM albums"))

    db.session.commit()
