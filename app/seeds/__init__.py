from flask.cli import AppGroup
from .users import seed_users, undo_users
from .albums import seed_albums, undo_albums
from .songs import seed_songs, undo_songs
from .playlists import seed_playlists, undo_playlists
from .playlist_songs import seed_playlist_songs, undo_playlist_songs

from app.models import User

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    # This command may run as part of the Render build, so it has to be safe
    # to run on every deploy. It never wipes existing data: if the database
    # already has users in it, leave everything alone. To start over from
    # fresh seed data, run `flask seed undo` first and then `flask seed all`.
    if User.query.first() is not None:
        print("Database already has data; skipping seeding. "
              "Run `flask seed undo` first if you want to reset it.")
        return

    seed_users()
    seed_albums()
    seed_songs()
    seed_playlists()
    seed_playlist_songs()


# Creates the `flask seed undo` command
# Clears every seeded table. Only run this on purpose: it deletes all data,
# including anything users have created.
@seed_commands.command('undo')
def undo():
    undo_playlist_songs()
    undo_playlists()
    undo_songs()
    undo_albums()
    undo_users()
    # Add other undo functions here
