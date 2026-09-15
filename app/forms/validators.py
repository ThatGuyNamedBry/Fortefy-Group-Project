from urllib.parse import urlparse

from wtforms.validators import StopValidation, ValidationError

IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg')


class ImageUrl:
    """
    Accepts an http(s) URL that ends in an image extension.

    Cover art is rendered straight into an <img src>, so anything else either
    shows a broken image or, with a scheme like javascript:, is worth keeping
    out of the database entirely. The rule mirrors checkImageErrors in the
    React helpers so the two sides agree.
    """

    def __call__(self, form, field):
        url = (field.data or '').strip()
        if not url:
            return

        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc:
            raise ValidationError(
                'Image URL must be a valid URL that starts with "https://"')

        if not parsed.path.lower().endswith(IMAGE_EXTENSIONS):
            raise ValidationError(
                'Image URL must end in .jpg, .png, .gif, .bmp, .svg, or .jpeg')


class NumberRequired:
    """
    InputRequired for a number field.

    WTForms' own InputRequired asks whether the raw value is truthy, so a
    submitted 0 counts as nothing submitted: year 0 and track number 0 came back
    as 'This field is required.' instead of being reported as out of range.
    This only asks whether anything was sent, and leaves what the number may be
    to NumberRange.
    """

    field_flags = {'required': True}

    def __init__(self, message=None):
        self.message = message

    def __call__(self, form, field):
        if field.raw_data and str(field.raw_data[0]).strip() != '':
            return
        field.errors[:] = []
        raise StopValidation(
            self.message or field.gettext('This field is required.'))
