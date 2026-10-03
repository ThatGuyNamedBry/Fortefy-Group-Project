from app.models import Album, Like, Playlist, PlaylistSong, Song, User, db
from app.seeds.users import LIBRARY_EMAIL


def counts():
    # Forget loaded rows: SQLite hands the same ids out again after an undo
    db.session.expunge_all()
    return {
        model.__name__: model.query.count()
        for model in (User, Album, Song, Playlist, PlaylistSong, Like)
    }


def test_seed_all_then_undo(app):
    runner = app.test_cli_runner()

    result = runner.invoke(args=['seed', 'all'])
    assert result.exit_code == 0, result.output
    assert counts() == {
        'User': 6,
        'Album': 10,
        'Song': 32,
        'Playlist': 5,
        'PlaylistSong': 10,
        'Like': 0,
    }

    # The library belongs to an account nobody can log in as
    library = User.query.filter_by(email=LIBRARY_EMAIL).one()
    assert library.hashed_password is None
    assert {album.user_id for album in Album.query} == {library.id}
    assert {song.user_id for song in Song.query} == {library.id}

    # Running it again changes nothing: Render may run it on every deploy
    again = runner.invoke(args=['seed', 'all'])
    assert 'skipping seeding' in again.output
    assert counts()['User'] == 6

    undone = runner.invoke(args=['seed', 'undo'])
    assert undone.exit_code == 0, undone.output
    assert set(counts().values()) == {0}

    # And it can be seeded again from empty
    assert runner.invoke(args=['seed', 'all']).exit_code == 0
    assert counts()['Song'] == 32


def test_seeded_playlists_have_no_hotlinked_art(app):
    app.test_cli_runner().invoke(args=['seed', 'all'])

    assert {playlist.art for playlist in Playlist.query} == {None}
    assert all(album.art.startswith('https://fortefy-song-url.') for album in Album.query)
