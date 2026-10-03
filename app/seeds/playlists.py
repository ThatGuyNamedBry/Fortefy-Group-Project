from app.models import db, environment, SCHEMA, Playlist
from sqlalchemy.sql import text


def seed_playlists():
    # No art of their own: each shows its first song's album cover. They used
    # to hotlink covers from imgur, gq.com and techiemore.com.
    playlist1 = Playlist(user_id=1, title="David's Playlist", description='Good vibes')

    playlist2 = Playlist(
        user_id=1, title='Just doing random things', description="When you're bored at home"
    )

    playlist3 = Playlist(user_id=2, title="Dancin'", description='When you gotta move')

    playlist4 = Playlist(
        user_id=3, title="Driving 'round, doing my thang", description='When you just wanna DRIVEEE'
    )

    playlist5 = Playlist(user_id=3, title='Workout', description='Heavy beats = Heavy muscles')

    all_playlists = [playlist1, playlist2, playlist3, playlist4, playlist5]
    _ = db.session.add_all(all_playlists)
    db.session.commit()


def undo_playlists():
    if environment == 'production':
        db.session.execute(text(f'TRUNCATE table {SCHEMA}.playlists RESTART IDENTITY CASCADE;'))
    else:
        db.session.execute(text('DELETE FROM playlists'))

    db.session.commit()
