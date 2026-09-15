from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, Length, ValidationError
from app.models import User


def user_exists(form, field):
    # Checking if user exists
    email = field.data
    user = User.query.filter(User.email == email).first()
    if user:
        raise ValidationError('Email address is already in use.')


def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError('Username is already in use.')


class SignUpForm(FlaskForm):
    # These mirror the rules the signup modal already applies in the browser,
    # which is the only place they were enforced before. The maximums also match
    # the db.String(n) on each column, so an oversized value is a 400 rather
    # than a StringDataRightTruncation 500 on Postgres.
    username = StringField(
        'username', validators=[DataRequired(), Length(min=4, max=40), username_exists])
    email = StringField(
        'email', validators=[DataRequired(), Email(), Length(max=255), user_exists])
    password = StringField('password', validators=[DataRequired(), Length(min=6)])
