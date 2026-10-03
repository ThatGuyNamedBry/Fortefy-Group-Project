"""store no art as NULL instead of a hotlinked default image

Revision ID: 8a01987527ee
Revises: fb3504bd4d61
Create Date: 2026-10-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# revision identifiers, used by Alembic.
revision = '8a01987527ee'
down_revision = 'fb3504bd4d61'
branch_labels = None
depends_on = None

schema = SCHEMA if environment == "production" else None

# What the app used to store when an album or playlist had no art
OLD_ALBUM_DEFAULT = 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Compact_Disc.jpg'
OLD_PLAYLIST_DEFAULT = 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'

# The seed playlists' covers, hotlinked from sites the project doesn't control
OLD_SEED_PLAYLIST_ART = [
    'https://i.imgur.com/cXMlpKQ.jpg',
    'https://i.imgur.com/UEG3m9q.jpg',
    'https://i.imgur.com/rfCl1VP.jpg',
    'https://media.gq.com/photos/5ae3925b3fb87856d8a5cdf6/16:9/w_2560%2Cc_limit/Road-Trip-Playlist-GQ-April-2018-042718-3x2.png',
    'https://techiemore.com/wp-content/uploads/White-Modern-Gym-Fitness-Playlist-Cover.jpg',
]

albums = sa.table('albums', sa.column('art', sa.String()), schema=schema)
playlists = sa.table('playlists', sa.column('art', sa.String()), schema=schema)


def upgrade():
    # No art is now NULL, and the client picks the cover to show in its place
    op.execute(albums.update()
               .where(albums.c.art.in_([OLD_ALBUM_DEFAULT, '']))
               .values(art=None))
    op.execute(playlists.update()
               .where(playlists.c.art.in_([OLD_PLAYLIST_DEFAULT, ''] + OLD_SEED_PLAYLIST_ART))
               .values(art=None))


def downgrade():
    # The old code expected a URL. Which seed cover each playlist had is not
    # kept, so every playlist without art gets the old default.
    op.execute(albums.update().where(albums.c.art.is_(None)).values(art=OLD_ALBUM_DEFAULT))
    op.execute(playlists.update().where(playlists.c.art.is_(None)).values(art=OLD_PLAYLIST_DEFAULT))
