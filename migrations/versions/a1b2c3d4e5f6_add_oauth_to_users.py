"""add oauth columns to users

Revision ID: a1b2c3d4e5f6
Revises: df3635efa674
Create Date: 2023-08-24 09:12:44.518233

"""
from alembic import op
import sqlalchemy as sa

import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'df3635efa674'
branch_labels = None
depends_on = None

# SQLite cannot ALTER a column or add a constraint in place, so alembic has to
# copy the table. batch_alter_table does that on SQLite and issues plain ALTERs
# on Postgres.
users_schema = SCHEMA if environment == "production" else None


def upgrade():
    with op.batch_alter_table('users', schema=users_schema) as batch_op:
        batch_op.add_column(
            sa.Column('oauth_provider', sa.String(length=20), nullable=True))
        batch_op.add_column(
            sa.Column('oauth_id', sa.String(length=255), nullable=True))
        # OAuth users never pick a password, so there is no hash to store
        batch_op.alter_column(
            'hashed_password',
            existing_type=sa.String(length=255),
            nullable=True)
        batch_op.create_unique_constraint(
            'uq_users_oauth', ['oauth_provider', 'oauth_id'])


def downgrade():
    # Accounts that only ever signed in with a provider have no password, so
    # they cannot be represented once hashed_password is required again
    users = 'users' if users_schema is None else f'{users_schema}.users'
    op.execute(f"DELETE FROM {users} WHERE hashed_password IS NULL")

    with op.batch_alter_table('users', schema=users_schema) as batch_op:
        batch_op.drop_constraint('uq_users_oauth', type_='unique')
        batch_op.alter_column(
            'hashed_password',
            existing_type=sa.String(length=255),
            nullable=False)
        batch_op.drop_column('oauth_id')
        batch_op.drop_column('oauth_provider')
