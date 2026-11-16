"""
The reference docs against the code they describe.

The README's API section and the schema doc drifted until they described
routes, fields and columns that no longer existed. These fail as soon as
documentation/api.md or documentation/database_schema.md disagrees with the app
again, or a link between the docs stops pointing anywhere.
"""

import json
import re
from pathlib import Path
from urllib.parse import unquote

from conftest import make_album, make_playlist, make_song
from app.models import db

ROOT = Path(__file__).resolve().parent.parent
API_DOC = ROOT / 'documentation' / 'api.md'
SCHEMA_DOC = ROOT / 'documentation' / 'database_schema.md'
LINKED_DOCS = [
    ROOT / 'README.md',
    ROOT / 'CONTRIBUTING.md',
    ROOT / 'react-app' / 'README.md',
    *sorted((ROOT / 'documentation').glob('*.md')),
]


def read(path):
    return path.read_text(encoding='utf-8')


def without_code_blocks(text):
    return re.sub(r'^```.*?^```', '', text, flags=re.M | re.S)


# api.md


def documented_routes():
    """('GET', '/api/albums/:id') for each route heading in api.md"""
    return set(re.findall(r'^### `(GET|POST|PUT|DELETE) (/api/\S*)`$', read(API_DOC), re.M))


def app_routes(app):
    """The same, from Flask's URL map, with <int:id> written as :id"""
    routes = set()
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            path = re.sub(r'<(?:\w+:)?(\w+)>', r':\1', rule.rule)
            routes.update((method, path) for method in rule.methods - {'HEAD', 'OPTIONS'})
    return routes


def test_every_route_is_documented(app):
    assert app_routes(app) - documented_routes() == set()


def test_every_documented_route_exists(app):
    assert documented_routes() - app_routes(app) == set()


def documented_objects():
    """Each example under api.md's Objects heading, by name"""
    objects = read(API_DOC).split('\n## Objects\n')[1].split('\n## ')[0]
    return {
        name: json.loads(example)
        for name, example in re.findall(r'^### (.+?)$.*?^```json$(.*?)^```$', objects, re.M | re.S)
    }


def fields(value):
    """The field names of a JSON value, nested ones included. A list is
    described by its first item, so an example has to show one."""
    if isinstance(value, dict):
        return {key: fields(item) for key, item in value.items()}
    if isinstance(value, list):
        return [fields(value[0])] if value else []
    return None


def test_documented_objects_have_the_fields_the_api_sends(alice, as_alice):
    album = make_album(alice)
    song = make_song(album)
    like = as_alice.post(f'/api/songs/{song.id}/add-like').get_json()
    playlist = make_playlist(alice, songs=[song])

    sent = {
        'User': as_alice.get(f'/api/users/{alice.id}'),
        'Current user': as_alice.get('/api/auth/'),
        'Song': as_alice.get(f'/api/songs/{song.id}'),
        'Like': as_alice.get(f'/api/songs/{song.id}/likes'),
        'Album': as_alice.get(f'/api/albums/{album.id}'),
        'Playlist': as_alice.get(f'/api/playlists/{playlist.id}'),
    }
    sent = {name: response.get_json() for name, response in sent.items()}
    sent['Like'] = sent['Like'][0]
    assert sent['Like']['id'] == like['id']

    documented = documented_objects()
    assert documented.keys() == sent.keys()
    for name, example in documented.items():
        assert fields(example) == fields(sent[name]), name


# database_schema.md


def documented_tables():
    """{table: {column: (type, details)}} from the schema doc's tables"""
    tables = {}
    sections = re.findall(r'^## `(\w+)`$(.*?)(?=^## |\Z)', read(SCHEMA_DOC), re.M | re.S)
    for table, section in sections:
        rows = re.findall(r'^\| `(\w+)` \| ([^|]+?) \| ([^|]*?) ?\|$', section, re.M)
        tables[table] = {column: (type_, details) for column, type_, details in rows}
    return tables


def test_schema_doc_has_every_table_and_column():
    documented = documented_tables()
    assert sorted(documented) == sorted(db.metadata.tables)
    for table in db.metadata.sorted_tables:
        assert list(documented[table.name]) == [column.name for column in table.columns], table


def test_schema_doc_describes_each_column_correctly():
    documented = documented_tables()
    for table in db.metadata.sorted_tables:
        for column in table.columns:
            # A missing one is test_schema_doc_has_every_table_and_column's to report
            if column.name not in documented.get(table.name, {}):
                continue
            type_, details = documented[table.name][column.name]
            where = f'{table.name}.{column.name}'
            assert type_ == str(column.type).lower(), where
            if column.primary_key:
                assert details == 'primary key', where
            else:
                assert details.startswith('not null') == (not column.nullable), where
            assert ('unique' in details) == bool(column.unique), where
            for key in column.foreign_keys:
                assert f'foreign key to `{key.target_fullname}`' in details, where


def test_schema_diagram_matches_the_foreign_keys():
    drawn = set(re.findall(r'^ +(\w+) \|\|--o\{ (\w+) :', read(SCHEMA_DOC), re.M))
    actual = {
        (key.column.table.name, table.name)
        for table in db.metadata.sorted_tables
        for key in table.foreign_keys
    }
    assert drawn == actual


# Links between the docs


def github_anchor(heading):
    """The id GitHub gives a heading: lowercased, punctuation dropped, spaces
    turned into hyphens"""
    return re.sub(r'[^\w\- ]', '', heading.strip().lower()).replace(' ', '-')


def anchors(path):
    headings = re.findall(r'^#+ (.+)$', without_code_blocks(read(path)), re.M)
    return {github_anchor(heading) for heading in headings}


def test_links_between_the_docs_lead_somewhere():
    broken = []
    for doc in LINKED_DOCS:
        links = re.findall(r'\]\(([^)\s]+)\)', without_code_blocks(read(doc)))
        for link in links:
            if re.match(r'[a-z]+:', link):
                continue
            target, _, anchor = unquote(link).partition('#')
            path = (doc.parent / target).resolve() if target else doc
            if not path.exists():
                broken.append(f'{doc.name}: {link}')
            elif anchor and path.suffix == '.md' and anchor not in anchors(path):
                broken.append(f'{doc.name}: {link}')
    assert broken == []
