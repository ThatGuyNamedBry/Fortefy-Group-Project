"""created_at and updated_at on every table, all snake_case and not null

Revision ID: 46ca4a44b048
Revises: a1b2c3d4e5f6
Create Date: 2026-09-29 21:38:38.833569

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# revision identifiers, used by Alembic.
revision = '46ca4a44b048'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

# SQLite cannot rename a column or make one NOT NULL in place, so alembic has
# to copy the table. batch_alter_table does that on SQLite and issues plain
# ALTERs on Postgres.
schema = SCHEMA if environment == "production" else None

# Created with camelCase createdAt/updatedAt; every other column is snake_case
RENAMED = ['albums', 'playlist_songs']
# Never had timestamps at all
ADDED = ['users', 'playlists', 'likes']


def upgrade():
    for table in RENAMED:
        with op.batch_alter_table(table, schema=schema) as batch_op:
            batch_op.alter_column(
                'createdAt', new_column_name='created_at',
                existing_type=sa.DateTime(), existing_nullable=False)
            batch_op.alter_column(
                'updatedAt', new_column_name='updated_at',
                existing_type=sa.DateTime(), existing_nullable=False)

    for table in ADDED:
        with op.batch_alter_table(table, schema=schema) as batch_op:
            batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
            batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

    # songs already had the columns, but nullable. Existing rows in all four
    # tables get the time of this upgrade, since their real creation time was
    # never recorded; then the columns can become NOT NULL like the models.
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for table in ADDED + ['songs']:
        rows = sa.table(
            table,
            sa.column('created_at', sa.DateTime()),
            sa.column('updated_at', sa.DateTime()),
            schema=schema)
        op.execute(rows.update()
                   .where(rows.c.created_at.is_(None))
                   .values(created_at=now))
        op.execute(rows.update()
                   .where(rows.c.updated_at.is_(None))
                   .values(updated_at=now))

        with op.batch_alter_table(table, schema=schema) as batch_op:
            batch_op.alter_column(
                'created_at', existing_type=sa.DateTime(), nullable=False)
            batch_op.alter_column(
                'updated_at', existing_type=sa.DateTime(), nullable=False)


def downgrade():
    with op.batch_alter_table('songs', schema=schema) as batch_op:
        batch_op.alter_column(
            'created_at', existing_type=sa.DateTime(), nullable=True)
        batch_op.alter_column(
            'updated_at', existing_type=sa.DateTime(), nullable=True)

    for table in ADDED:
        with op.batch_alter_table(table, schema=schema) as batch_op:
            batch_op.drop_column('updated_at')
            batch_op.drop_column('created_at')

    for table in RENAMED:
        with op.batch_alter_table(table, schema=schema) as batch_op:
            batch_op.alter_column(
                'created_at', new_column_name='createdAt',
                existing_type=sa.DateTime(), existing_nullable=False)
            batch_op.alter_column(
                'updated_at', new_column_name='updatedAt',
                existing_type=sa.DateTime(), existing_nullable=False)
