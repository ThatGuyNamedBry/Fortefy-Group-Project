from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import SubmitField, StringField, IntegerField
from wtforms.validators import DataRequired
from ..api.aws_helper import ALLOWED_EXTENSIONS

class EditSongForm(FlaskForm):
    name = StringField('name', validators=[DataRequired()])
    song = FileField('song', validators=[FileAllowed(list(ALLOWED_EXTENSIONS)), FileRequired()])
    track_number = IntegerField('track_number', validators=[DataRequired()])
    submit = SubmitField('Submit')
