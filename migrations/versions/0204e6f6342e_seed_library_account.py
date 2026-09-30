"""give the seed library to an account nobody can log in as

Revision ID: 0204e6f6342e
Revises: 9d2654a24b3c
Create Date: 2026-09-30 14:01:27.129585

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# revision identifiers, used by Alembic.
revision = '0204e6f6342e'
down_revision = '9d2654a24b3c'
branch_labels = None
depends_on = None

schema = SCHEMA if environment == "production" else None

# Frozen copies of the accounts in app/seeds/users.py
LIBRARY_USERNAME = 'Fortefy'
LIBRARY_EMAIL = 'library@fortefy.invalid'
DEMO_EMAIL = 'demo@aa.io'
# Every seeded song and cover is stored here; uploads never are
SEED_ASSETS = 'https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/%'

users = sa.table(
    'users',
    sa.column('id', sa.Integer()), sa.column('username', sa.String()),
    sa.column('email', sa.String()), sa.column('hashed_password', sa.String()),
    sa.column('created_at', sa.DateTime()), sa.column('updated_at', sa.DateTime()),
    schema=schema)
albums = sa.table(
    'albums', sa.column('id', sa.Integer()), sa.column('user_id', sa.Integer()),
    sa.column('art', sa.String()),
    schema=schema)
songs = sa.table(
    'songs', sa.column('id', sa.Integer()), sa.column('user_id', sa.Integer()),
    sa.column('album_id', sa.Integer()), sa.column('song_url', sa.String()),
    schema=schema)


def upgrade():
    conn = op.get_bind()

    seeded_songs = songs.c.song_url.like(SEED_ASSETS)
    # An album whose songs were all deleted still has its seeded cover
    seeded_albums = sa.or_(
        albums.c.art.like(SEED_ASSETS),
        albums.c.id.in_(sa.select(songs.c.album_id).where(seeded_songs)))

    # Nothing seeded, which includes the empty database `flask db upgrade`
    # creates before `flask seed all`. Creating the account there would make
    # seed all see a user, decide the database already has data, and skip.
    if conn.execute(sa.select(albums.c.id).where(seeded_albums).limit(1)).first() is None:
        return

    library_id = conn.execute(
        sa.select(users.c.id).where(users.c.email == LIBRARY_EMAIL)).scalar()
    if library_id is None:
        # Someone may already have signed up as "Fortefy"
        username, n = LIBRARY_USERNAME, 1
        while conn.execute(sa.select(users.c.id).where(users.c.username == username)).first():
            n += 1
            username = f'{LIBRARY_USERNAME} {n}'

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        conn.execute(users.insert().values(
            username=username, email=LIBRARY_EMAIL, hashed_password=None,
            created_at=now, updated_at=now))
        library_id = conn.execute(
            sa.select(users.c.id).where(users.c.email == LIBRARY_EMAIL)).scalar()

    # Only the seeded songs: anything a visitor uploaded, even into a seeded
    # album, stays theirs
    conn.execute(songs.update().where(seeded_songs).values(user_id=library_id))
    conn.execute(albums.update().where(seeded_albums).values(user_id=library_id))


def downgrade():
    # Hand the library to Demo, which owned most of it before (who owned the
    # rest is not kept anywhere), and remove the account. Left in place, a
    # passwordless account that owns albums makes a1b2c3d4e5f6's downgrade,
    # which deletes every user without a password, fail on the albums'
    # foreign key.
    conn = op.get_bind()
    library_id = conn.execute(
        sa.select(users.c.id).where(users.c.email == LIBRARY_EMAIL)).scalar()
    demo_id = conn.execute(
        sa.select(users.c.id).where(users.c.email == DEMO_EMAIL)).scalar()
    if library_id is None or demo_id is None:
        return

    conn.execute(songs.update().where(songs.c.user_id == library_id).values(user_id=demo_id))
    conn.execute(albums.update().where(albums.c.user_id == library_id).values(user_id=demo_id))
    conn.execute(users.delete().where(users.c.id == library_id))
