from flask import Blueprint, jsonify, request
from sqlalchemy import case, func, or_
from app.models import Album, Song

search_routes = Blueprint('search', __name__)

# Keep a runaway query string or result set from tying up the database.
MAX_QUERY_LENGTH = 100
MAX_RESULTS = 50
LIKE_ESCAPE = '\\'


def escape_like(term):
    """
    Escape the LIKE wildcards in a search term so that searching for "100%"
    matches that text literally instead of matching everything.
    """
    return (
        term.replace(LIKE_ESCAPE, LIKE_ESCAPE * 2)
            .replace('%', LIKE_ESCAPE + '%')
            .replace('_', LIKE_ESCAPE + '_')
    )


def rank_by_name(name_column, starts_with_pattern):
    """
    Ordering that lists names starting with the search term first, then the
    rest alphabetically.
    """
    starts_with_term = case(
        (name_column.ilike(starts_with_pattern, escape=LIKE_ESCAPE), 0),
        else_=1,
    )
    return [starts_with_term, func.lower(name_column)]


@search_routes.route('')
def search():
    """
    Search songs by song name or artist, and albums by album name or artist.
    Pass the search term as ?q=<term>. Returns {"songs": [...], "albums": [...]}
    """
    term = request.args.get('q', '')[:MAX_QUERY_LENGTH].strip()

    if not term:
        return jsonify({'songs': [], 'albums': []})

    escaped = escape_like(term)
    contains = f'%{escaped}%'
    starts_with = f'{escaped}%'

    songs = (
        Song.query
        .join(Song.album)
        .filter(or_(
            Song.name.ilike(contains, escape=LIKE_ESCAPE),
            Album.artist.ilike(contains, escape=LIKE_ESCAPE),
        ))
        .order_by(*rank_by_name(Song.name, starts_with))
        .limit(MAX_RESULTS)
        .all()
    )

    albums = (
        Album.query
        .filter(or_(
            Album.name.ilike(contains, escape=LIKE_ESCAPE),
            Album.artist.ilike(contains, escape=LIKE_ESCAPE),
        ))
        .order_by(*rank_by_name(Album.name, starts_with))
        .limit(MAX_RESULTS)
        .all()
    )

    return jsonify({
        'songs': [song.to_dict() for song in songs],
        'albums': [album.to_dict() for album in albums],
    })
