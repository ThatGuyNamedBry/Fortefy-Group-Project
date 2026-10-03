"""
The migrations, run the way Render runs them: `flask db upgrade` in a process
of its own, here against a throwaway SQLite file. The tests' own database is
built with create_all(), so without this nothing would notice a model and a
migration disagreeing.
"""

import os
import subprocess
import sys
from pathlib import Path

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect

from app.models import db

ROOT = Path(__file__).resolve().parent.parent


def flask_db(database, *args):
    env = {**os.environ, 'DATABASE_URL': f'sqlite:///{database}'}
    result = subprocess.run(
        [sys.executable, '-m', 'flask', '--app', 'app', 'db', *args],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    return result


@pytest.fixture
def database(tmp_path):
    return tmp_path / 'migrations.db'


def tables(database):
    engine = create_engine(f'sqlite:///{database}')
    try:
        return set(inspect(engine).get_table_names())
    finally:
        engine.dispose()


def test_upgrade_matches_the_models_and_downgrade_undoes_it(database):
    flask_db(database, 'upgrade')

    assert tables(database) == {
        'alembic_version',
        'users',
        'albums',
        'songs',
        'likes',
        'playlists',
        'playlist_songs',
    }
    engine = create_engine(f'sqlite:///{database}')
    try:
        with engine.connect() as connection:
            differences = compare_metadata(MigrationContext.configure(connection), db.metadata)
    finally:
        engine.dispose()
    assert differences == []

    flask_db(database, 'downgrade', 'base')
    assert tables(database) == {'alembic_version'}

    # And back up again from nothing
    flask_db(database, 'upgrade')
    assert 'songs' in tables(database)


def test_there_is_one_head(database):
    heads = flask_db(database, 'heads').stdout.strip().splitlines()

    assert len(heads) == 1, heads
