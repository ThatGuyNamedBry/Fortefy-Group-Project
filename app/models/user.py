from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    # A given provider account may only ever be linked to one user
    __table_args__ = (
        db.UniqueConstraint('oauth_provider', 'oauth_id', name='uq_users_oauth'),
    )

    if environment == "production":
        __table_args__ = __table_args__ + ({'schema': SCHEMA},)

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    # Nullable because users who sign up through OAuth never choose a password
    hashed_password = db.Column(db.String(255), nullable=True)
    # Which provider this account signs in with ('google'), and that provider's
    # own stable id for the user. Both null for plain email/password accounts.
    oauth_provider = db.Column(db.String(20), nullable=True)
    oauth_id = db.Column(db.String(255), nullable=True)

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password) if password else None

    def check_password(self, password):
        # OAuth-only accounts have no hash to compare against, so no password
        # can ever be correct for them
        if not self.hashed_password:
            return False
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
    albums = db.relationship('Album', back_populates='user')
    songs = db.relationship('Song', back_populates='user')
    likes = db.relationship('Like', back_populates='user')
    playlists = db.relationship('Playlist', back_populates='user')
