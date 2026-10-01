"""foreign keys cascade on delete, and one like per user per song

Revision ID: fb3504bd4d61
Revises: 0204e6f6342e
Create Date: 2026-10-01 17:01:35.600260

"""
from alembic import op
import sqlalchemy as sa

import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# revision identifiers, used by Alembic.
revision = 'fb3504bd4d61'
down_revision = '0204e6f6342e'
branch_labels = None
depends_on = None

schema = SCHEMA if environment == "production" else None

# Every foreign key in the schema, by table: (column, the table it refers to)
FOREIGN_KEYS = {
    'albums': [('user_id', 'users')],
    'songs': [('user_id', 'users'), ('album_id', 'albums')],
    'playlists': [('user_id', 'users')],
    'likes': [('song_id', 'songs'), ('user_id', 'users')],
    'playlist_songs': [('song_id', 'songs'), ('playlist_id', 'playlists')],
}

# Postgres named these constraints <table>_<column>_fkey when the tables were
# created. SQLite never named them, and batch mode can only drop a constraint
# by name, so the same convention names the ones it reflects there too.
NAMING = {'fk': '%(table_name)s_%(column_0_name)s_fkey'}


def set_ondelete(ondelete):
    for table, keys in FOREIGN_KEYS.items():
        with op.batch_alter_table(table, schema=schema, naming_convention=NAMING) as batch_op:
            for column, referred in keys:
                name = f'{table}_{column}_fkey'
                batch_op.drop_constraint(name, type_='foreignkey')
                batch_op.create_foreign_key(
                    name, referred, [column], ['id'],
                    ondelete=ondelete, referent_schema=schema)


def upgrade():
    # Nothing stopped two likes of the same song by the same user until now,
    # so drop any that got in, keeping the first
    likes = sa.table('likes', sa.column('id', sa.Integer()), sa.column('song_id', sa.Integer()),
                     sa.column('user_id', sa.Integer()), schema=schema)
    first_likes = sa.select(sa.func.min(likes.c.id)).group_by(likes.c.song_id, likes.c.user_id)
    op.execute(likes.delete().where(likes.c.id.notin_(first_likes)))

    with op.batch_alter_table('likes', schema=schema) as batch_op:
        batch_op.create_unique_constraint('uq_likes_song_user', ['song_id', 'user_id'])

    # The database now deletes dependent rows itself, so raw SQL, flask seed
    # undo and the ORM agree on what a delete takes with it
    set_ondelete('CASCADE')


def downgrade():
    set_ondelete(None)

    with op.batch_alter_table('likes', schema=schema) as batch_op:
        batch_op.drop_constraint('uq_likes_song_user', type_='unique')
