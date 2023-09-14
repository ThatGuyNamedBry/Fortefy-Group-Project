from app.models import db, environment, SCHEMA, Playlist
from sqlalchemy.sql import text

def seed_playlists():
    playlist1 = Playlist(
        user_id=1,
        title="David's Playlist",
        art="https://i.imgur.com/cXMlpKQ.jpg",
        description="Good vibes"
    )

    playlist2 = Playlist(
        user_id=1,
        title="Just doing random things",
        art="https://i.imgur.com/UEG3m9q.jpg",
        description="When you're bored at home"
    )

    playlist3 = Playlist(
        user_id=2,
        title="Dancin'",
        art="https://i.imgur.com/rfCl1VP.jpg",
        description="When you gotta move"
    )

    playlist4 = Playlist(
        user_id=3,
        title="Driving 'round, doing my thang",
        art="https://media.gq.com/photos/5ae3925b3fb87856d8a5cdf6/16:9/w_2560%2Cc_limit/Road-Trip-Playlist-GQ-April-2018-042718-3x2.png",
        description="When you just wanna DRIVEEE"
    )

    playlist5 = Playlist(
        user_id=3,
        title="Workout",
        art="https://techiemore.com/wp-content/uploads/White-Modern-Gym-Fitness-Playlist-Cover.jpg",
        description="Heavy beats = Heavy muscles"
    )

    all_playlists = [playlist1, playlist2, playlist3, playlist4, playlist5]
    _ = db.session.add_all(all_playlists)
    db.session.commit()

def undo_playlists():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlists"))

    db.session.commit()
