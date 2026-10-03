import logging
from logging.config import fileConfig

from alembic import context
from flask import current_app

import os

environment = os.getenv('FLASK_ENV')
SCHEMA = os.environ.get('SCHEMA')


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

# The app's own engine, so migrations connect exactly the way the app does
engine = current_app.extensions['migrate'].db.engine
# Only offline mode (--sql) reads this. render_as_string, not str(): since
# SQLAlchemy 2.0, str() writes the password as ***
config.set_main_option(
    'sqlalchemy.url', engine.url.render_as_string(hide_password=False).replace('%', '%%')
)
target_metadata = current_app.extensions['migrate'].db.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline():
    """Run migrations in 'offline' mode.
    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.
    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option('sqlalchemy.url')
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.
    In this scenario we need to create an Engine
    and associate a connection with the context.
    """

    # this callback is used to prevent an auto-migration from being generated
    # when there are no changes to the schema
    # reference: http://alembic.zzzcomputing.com/en/latest/cookbook.html
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected.')

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            process_revision_directives=process_revision_directives,
            **current_app.extensions['migrate'].configure_args,
        )

        with context.begin_transaction():
            # Production keeps every table in its own schema. Created inside
            # the migration's transaction: run on the connection before it,
            # SQLAlchemy 2's autobegin would open a transaction that Alembic
            # then defers to and never commits
            if environment == 'production':
                context.execute(f'CREATE SCHEMA IF NOT EXISTS {SCHEMA}')
                context.execute(f'SET search_path TO {SCHEMA}')
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
