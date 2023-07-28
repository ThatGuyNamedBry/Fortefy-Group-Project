from app.models import db, User, environment, SCHEMA, Album
# from sqlalchemy.sql import text

def seed_albums():
    album1 = Album(
        name='Album 1',
        user_id=1,
        art='https://upload.wikimedia.org/wikipedia/commons/e/ed/Compact_Disc.jpg',
        artist='Artist 1',
        year=2023,
        genre='Rock'
    )

    db.session.add(album1)
    db.session.commit()
