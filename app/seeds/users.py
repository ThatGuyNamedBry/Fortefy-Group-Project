from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text

# The account that owns the seeded albums and songs. It has no password and no
# OAuth link, and .invalid is a reserved domain nobody can receive mail at, so
# neither login nor "Continue with Google" can ever get into it. That is the
# point: the public Demo login used to own the library, so any visitor could
# delete or rewrite it for everyone.
LIBRARY_USERNAME = 'Fortefy'
LIBRARY_EMAIL = 'library@fortefy.invalid'


def library_user():
    return User.query.filter(User.email == LIBRARY_EMAIL).one()


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(username='Demo', email='demo@aa.io', password='password')
    marnie = User(username='Marnie', email='marnie@aa.io', password='password')
    bobbie = User(username='Bobbie', email='bobbie@aa.io', password='password')
    tuneguru = User(username='Tune Guru', email='tuneguru@aa.io', password='password')
    musiclvr = User(username='Music Lvr', email='musiclvr@aa.io', password='password')
    # Added last so the people above keep ids 1 to 5, which the playlist seeds
    # refer to
    library = User(username=LIBRARY_USERNAME, email=LIBRARY_EMAIL)

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)
    db.session.add(tuneguru)
    db.session.add(musiclvr)
    db.session.add(library)
    db.session.commit()


# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == 'production':
        db.session.execute(text(f'TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;'))
    else:
        db.session.execute(text('DELETE FROM users'))

    db.session.commit()
