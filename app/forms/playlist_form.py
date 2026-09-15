from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField
from wtforms.validators import DataRequired, Length, Optional

from .validators import ImageUrl


class PlaylistForm(FlaskForm):
    """
    Used for both creating and updating a playlist, so the two can't drift
    apart. The columns are an unbounded db.String, so these lengths are the only
    thing keeping the fields to the sizes the UI is built for.
    """
    title = StringField("title", validators=[DataRequired(), Length(max=60)])
    art = StringField("art", validators=[Optional(), Length(max=255), ImageUrl()])
    description = StringField("description", validators=[Optional(), Length(max=254)])
    submit = SubmitField("Submit")
