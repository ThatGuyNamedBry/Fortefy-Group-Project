"""serve uploaded songs over https

Revision ID: 9d2654a24b3c
Revises: 46ca4a44b048
Create Date: 2026-09-30 12:08:29.650720

"""

from alembic import op
import sqlalchemy as sa

import os

environment = os.getenv('FLASK_ENV')
SCHEMA = os.environ.get('SCHEMA')

# revision identifiers, used by Alembic.
revision = '9d2654a24b3c'
down_revision = '46ca4a44b048'
branch_labels = None
depends_on = None

schema = SCHEMA if environment == 'production' else None


def upgrade():
    # Uploads used to be stored as http://<bucket>.s3.amazonaws.com/<key>,
    # which the browser blocks as mixed content on the https site. S3 serves
    # the same objects over https, so only the scheme changes.
    songs = sa.table('songs', sa.column('song_url', sa.String()), schema=schema)
    op.execute(
        songs.update()
        .where(songs.c.song_url.like('http://%.amazonaws.com/%'))
        .values(
            song_url=sa.literal('https://') + sa.func.substr(songs.c.song_url, 8, type_=sa.String())
        )
    )


def downgrade():
    # Nothing to undo: every URL still points at the same object, and https
    # is correct for old and new code alike
    pass
