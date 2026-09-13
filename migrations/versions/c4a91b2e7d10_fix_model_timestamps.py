"""fix model timestamps: callable defaults, snake_case, missing columns

Revision ID: c4a91b2e7d10
Revises: df3635efa674
Create Date: 2026-09-13

"""
from alembic import op
import sqlalchemy as sa
import os


# revision identifiers, used by Alembic.
revision = 'c4a91b2e7d10'
down_revision = 'df3635efa674'
branch_labels = None
depends_on = None

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")


def upgrade():
    bind = op.get_bind()
    dialect = bind.dialect.name

    def table(name):
        if environment == "production" and SCHEMA:
            return f"{SCHEMA}.{name}"
        return name

    # albums / playlist_songs used camelCase column names
    if dialect == "postgresql":
        op.execute(f'ALTER TABLE {table("albums")} RENAME COLUMN "createdAt" TO created_at')
        op.execute(f'ALTER TABLE {table("albums")} RENAME COLUMN "updatedAt" TO updated_at')
        op.execute(f'ALTER TABLE {table("playlist_songs")} RENAME COLUMN "createdAt" TO created_at')
        op.execute(f'ALTER TABLE {table("playlist_songs")} RENAME COLUMN "updatedAt" TO updated_at')
    else:
        with op.batch_alter_table('albums') as batch_op:
            batch_op.alter_column('createdAt', new_column_name='created_at')
            batch_op.alter_column('updatedAt', new_column_name='updated_at')
        with op.batch_alter_table('playlist_songs') as batch_op:
            batch_op.alter_column('createdAt', new_column_name='created_at')
            batch_op.alter_column('updatedAt', new_column_name='updated_at')

    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('playlists', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('playlists', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('likes', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('likes', sa.Column('updated_at', sa.DateTime(), nullable=True))

    now = sa.func.now()
    op.execute(sa.text(f"UPDATE {table('users')} SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)"))
    op.execute(sa.text(f"UPDATE {table('playlists')} SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)"))
    op.execute(sa.text(f"UPDATE {table('likes')} SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)"))

    if environment == "production" and SCHEMA:
        op.execute(f"ALTER TABLE {SCHEMA}.users SET SCHEMA {SCHEMA};")


def downgrade():
    bind = op.get_bind()
    dialect = bind.dialect.name

    def table(name):
        if environment == "production" and SCHEMA:
            return f"{SCHEMA}.{name}"
        return name

    op.drop_column('likes', 'updated_at')
    op.drop_column('likes', 'created_at')
    op.drop_column('playlists', 'updated_at')
    op.drop_column('playlists', 'created_at')
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')

    if dialect == "postgresql":
        op.execute(f'ALTER TABLE {table("albums")} RENAME COLUMN created_at TO "createdAt"')
        op.execute(f'ALTER TABLE {table("albums")} RENAME COLUMN updated_at TO "updatedAt"')
        op.execute(f'ALTER TABLE {table("playlist_songs")} RENAME COLUMN created_at TO "createdAt"')
        op.execute(f'ALTER TABLE {table("playlist_songs")} RENAME COLUMN updated_at TO "updatedAt"')
    else:
        with op.batch_alter_table('albums') as batch_op:
            batch_op.alter_column('created_at', new_column_name='createdAt')
            batch_op.alter_column('updated_at', new_column_name='updatedAt')
        with op.batch_alter_table('playlist_songs') as batch_op:
            batch_op.alter_column('created_at', new_column_name='createdAt')
            batch_op.alter_column('updated_at', new_column_name='updatedAt')
