# App structure

ƒorteƒy is one Flask app that serves both the JSON API under `/api` and the
built React app for every other URL. In development, Vite's dev server serves
the React app instead and passes `/api` requests on to Flask.

```
app/                Flask: the API, models, forms and seeds
migrations/         Alembic migrations (Flask-Migrate)
react-app/          React: the single-page frontend, built with Vite
tests/              API tests (pytest)
documentation/      These docs
.github/workflows/  CI
```

## Backend: `app/`

| path | what it holds |
|---|---|
| `__init__.py` | creates the app, registers the blueprints below, serves the React build, and turns API errors into JSON |
| `config.py` | settings, read from the environment (`.env` locally) |
| `api/` | one blueprint per resource, each mounted under `/api` |
| `api/aws_helper.py` | uploads songs to S3 and deletes them again |
| `api/csrf.py` | reads the CSRF token from the `X-CSRFToken` header |
| `models/` | the SQLAlchemy models; each has a `to_dict()` that is the API's JSON for it |
| `forms/` | WTForms forms that validate request bodies |
| `oauth.py` | Google sign-in, through Authlib |
| `seeds/` | the `flask seed all` and `flask seed undo` commands |

The blueprints:

| file | routes under |
|---|---|
| `api/auth_routes.py` | `/api/auth`: login, signup, logout, Google sign-in |
| `api/user_routes.py` | `/api/users` |
| `api/album_routes.py` | `/api/albums`, including song uploads |
| `api/song_routes.py` | `/api/songs`, including likes |
| `api/playlist_routes.py` | `/api/playlists` |
| `api/search_routes.py` | `/api/search` |

Every route is described in [api.md](api.md), and every table in
[database_schema.md](database_schema.md).

## Frontend: `react-app/src/`

| path | what it holds |
|---|---|
| `index.jsx` | mounts the app with the Redux store, the router and the modal provider |
| `App.jsx` | the routes below, plus the navigation bar, footer and audio player around them |
| `store/` | Redux: one file per slice, with its actions, thunks and reducer |
| `components/` | one folder per component, with its CSS |
| `context/Modal.jsx` | the single modal the whole app shares |
| `csrf.js` | adds the `X-CSRFToken` header to requests that change data |
| `helpers.js` | shared helpers, such as fetching JSON and checking image URLs |

The store's slices:

| slice | holds |
|---|---|
| `session` | the logged-in user |
| `albums` | every album loaded so far, by id |
| `songs` | every song loaded so far, by id; pages pick out theirs with selectors |
| `playlists` | every playlist loaded so far, by id, and the one being viewed |
| `player` | the play queue and the song playing |
| `search` | the latest search results |

The pages, from `App.jsx`:

| URL | component |
|---|---|
| `/` | `HomeLandingPage` |
| `/profile` | `ProfilePage` |
| `/search?q=` | `SearchPage` |
| `/login`, `/signup` | the home page, with the login or signup modal open |
| `/albums/new` | `AlbumCreate` |
| `/albums/:albumId` | `AlbumDetails` |
| `/albums/:albumId/edit` | `AlbumUpdate` |
| `/playlists/new` | `PlaylistCreate` |
| `/playlists/liked` | `LikedSongs` |
| `/playlists/:playlistId` | `PlaylistDetails` |

`react-app/public/` holds files copied into the build as they are, such as the
favicon and the images the README shows. Tests sit next to what they test, as
`*.test.js` and `*.test.jsx`.

## Tests: `tests/`

One file per area of the API, plus `test_migrations.py` for the migrations and
`test_docs.py`, which checks these docs against the code. `conftest.py` sets up
an empty in-memory database for each test, clients that log in and send the
CSRF header, and a stand-in for S3.
