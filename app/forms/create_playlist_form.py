from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField
from wtforms.validators import DataRequired

class CreatePlaylistForm(FlaskForm):
    title = StringField("title", validators=[DataRequired()])
    art = StringField("art")
    description = StringField("description")
    submit = SubmitField("Submit")
