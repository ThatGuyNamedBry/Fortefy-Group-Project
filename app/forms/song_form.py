from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import SubmitField, StringField, IntegerField
from wtforms.validators import DataRequired, Length, NumberRange

from ..api.aws_helper import ALLOWED_EXTENSIONS
from .validators import NumberRequired


class SongForm(FlaskForm):
    """
    Updating a song. The audio file is optional here because an edit only
    changes the name and track number.
    """
    name = StringField('name', validators=[DataRequired(), Length(max=255)])
    song = FileField('song', validators=[FileAllowed(list(ALLOWED_EXTENSIONS))])
    # NumberRequired rather than DataRequired so track number 0 is rejected by
    # NumberRange as out of range instead of being reported as missing
    track_number = IntegerField('track_number', validators=[NumberRequired(), NumberRange(min=1)])
    submit = SubmitField('Submit')


class CreateSongForm(SongForm):
    """
    Creating a song. Same rules, except there has to be a file to upload. This
    is the only difference between the two, so everything else stays shared.
    """
    song = FileField('song', validators=[FileAllowed(list(ALLOWED_EXTENSIONS)), FileRequired()])
