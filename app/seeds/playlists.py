from app.models import db, User, environment, SCHEMA, Playlist
from sqlalchemy.sql import text

def seed_playlists():
    playlist1 = Playlist(
        user_id=1,
        title="David's Playlist",
        art="https://i.pinimg.com/originals/8e/1c/b0/8e1cb0fc5a57bb556ea83a308d652c94.jpg",
        description="What TA's listen to..."
    )

    playlist2 = Playlist(
        user_id=1,
        title="Just doing random things",
        art="https://media.gq.com/photos/5ae3925b3fb87856d8a5cdf6/16:9/w_2560%2Cc_limit/Road-Trip-Playlist-GQ-April-2018-042718-3x2.png",
        description="When you're bored at home"
    )

    playlist3 = Playlist(
        user_id=2,
        title="Vibessss",
        art="https://i.discogs.com/URpfwAORbUJ5I6MmnUIY7I9Q5Tibk2j5fDP-ivpwPPY/rs:fit/g:sm/q:90/h:590/w:591/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyMDE2/NTItMTIwMDM0NDM2/NS5qcGVn.jpeg",
        description="You already know what it is"
    )

    playlist4 = Playlist(
        user_id=3,
        title="Driving round doing my thang",
        art="https://media.gq.com/photos/5ae3925b3fb87856d8a5cdf6/16:9/w_2560%2Cc_limit/Road-Trip-Playlist-GQ-April-2018-042718-3x2.png",
        description="When you just wanna DRIVEEE"
    )

    playlist5 = Playlist(
        user_id=3,
        title="Workout",
        art="https://techiemore.com/wp-content/uploads/White-Modern-Gym-Fitness-Playlist-Cover.jpg",
        description="Heavy beats = heavy muscles"
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
