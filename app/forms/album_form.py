from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, IntegerField
from wtforms.validators import DataRequired, Length, NumberRange, Optional

from .validators import ImageUrl, NumberRequired


class AlbumForm(FlaskForm):
    """
    Used for both creating and updating an album, so the two can't drift apart.

    Every Length here matches the db.String(n) on the column: without them
    Postgres raises StringDataRightTruncation and the API answers 500, while
    SQLite in development silently accepts the overlong value.
    """
    name = StringField("name", validators=[DataRequired(), Length(max=255)])
    art = StringField("art", validators=[Optional(), Length(max=255), ImageUrl()])
    artist = StringField("artist", validators=[DataRequired(), Length(max=50)])
    # NumberRequired rather than DataRequired so year 0 is rejected by
    # NumberRange as out of range, not reported back as a missing field
    year = IntegerField("year", validators=[NumberRequired(), NumberRange(min=1, max=9999)])
    genre = StringField("genre", validators=[DataRequired(), Length(max=50)])
    submit = SubmitField("Submit")
