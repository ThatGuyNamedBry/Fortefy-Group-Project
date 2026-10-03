from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

import os

environment = os.getenv('FLASK_ENV')
SCHEMA = os.environ.get('SCHEMA')


db = SQLAlchemy()


# helper function for adding prefix to foreign key column references in production
def add_prefix_for_prod(attr):
    if environment == 'production':
        return f'{SCHEMA}.{attr}'
    else:
        return attr


def utcnow():
    """
    The current time as a naive UTC datetime, which is what the DateTime
    columns store. Pass the function itself as a column default, never its
    result: default=utcnow() is evaluated once at import, so every row would
    get the time the server started.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_iso(value):
    """
    A stored timestamp as ISO 8601 with a trailing Z. Without the Z,
    JavaScript's Date reads the string as the browser's local time, not UTC.
    """
    if value is None:
        return None
    return value.isoformat(timespec='milliseconds') + 'Z'
