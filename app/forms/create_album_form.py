from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, IntegerField
from wtforms.validators import DataRequired

class CreateAlbumForm(FlaskForm):
    name = StringField("name", validators=[DataRequired()])
    # art (save for when aws is set up)
    artist = StringField("artist", validators=[DataRequired()])
    year = IntegerField("year", validators=[DataRequired()])
    genre = StringField("genre", validators=[DataRequired()])
    submit = SubmitField("Submit")
