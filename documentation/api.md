# API reference

Every route the Flask server answers under `/api`. The examples are real
responses from the seeded database, after logging in as Demo and liking a
couple of songs, shortened to one item per list.

`tests/test_docs.py` keeps this file honest: it fails when a route here does
not exist, when a route exists that is not here, or when an example object's
fields differ from what the server sends. The running server also lists its
routes, with their docstrings, at [`GET /api/docs`](#get-apidocs).

- [Conventions](#conventions)
- [Objects](#objects): [User](#user), [Current user](#current-user),
  [Song](#song), [Like](#like), [Album](#album), [Playlist](#playlist)
- Routes: [Auth](#auth), [Users](#users), [Albums](#albums), [Songs](#songs),
  [Playlists](#playlists), [Search](#search), [Docs](#docs)

## Conventions

**Requests.** Bodies are JSON (`Content-Type: application/json`) or form data.
Song uploads have to be `multipart/form-data`, since they carry a file. A
request larger than 50 MB is refused with `413`.

**Logging in.** Logging in, signing up or finishing Google sign-in sets
Flask's session cookie, and the browser sends it from then on. A route marked
_Login required_ answers `401` without it:

```json
{ "errors": ["Unauthorized"] }
```

**CSRF.** Every response sets a `csrf_token` cookie. Send its value back in an
`X-CSRFToken` header on every `POST`, `PUT` and `DELETE`, as the frontend's
`csrfHeaders()` does. The routes that take a body check it, and report a
missing or wrong token as a validation error on `csrf_token`.

**Errors.** Every error is a JSON object with an `errors` key:

| status | when | `errors` |
|---|---|---|
| `400` | a body fails validation | an object with the first message for each field that failed, e.g. `{ "year": "Number must be between 1 and 9999." }` |
| `401` | login or signup fails validation | the same object, e.g. `{ "password": "Password was incorrect." }` |
| `401` | a _Login required_ route without a session | `["Unauthorized"]` |
| `403` | changing something that belongs to someone else | a message, e.g. `"Album does not belong to user"` |
| `404` | no such album, song, playlist or user | a message, e.g. `"Album not found"` |
| `404` | no such route under `/api` | `"Not found"` |
| `405` | a route that exists, with the wrong method | `"Method not allowed"` |
| `409` | liking a song twice | `"User has already liked song"` |
| `413` | a request over 50 MB | `"File is too large. The limit is 50 MB."` |
| `500` | anything unexpected | `"Internal server error"` |

**Timestamps** (`created_at`, `updated_at`) are UTC, in ISO 8601 with
milliseconds and a `Z`.

## Objects

What the routes send back. Objects nest: an album carries its songs, a song
carries its owner and a summary of its likes, a playlist carries its songs.

### User

Someone's public profile. Embedded in every song, album, like and playlist,
and those are readable without logging in, so it never carries an email
address.

```json
{
    "id": 1,
    "username": "Demo"
}
```

### Current user

The logged-in user, from the [auth](#auth) routes only: the public fields plus
the email address and the account's timestamps.

```json
{
    "created_at": "2026-10-04T05:15:04.116Z",
    "email": "demo@aa.io",
    "id": 1,
    "updated_at": "2026-10-04T05:15:04.116Z",
    "username": "Demo"
}
```

### Song

- `duration` is in whole seconds, measured from the file when it was uploaded.
- `artist`, `album_name` and `album_art` come from the song's album.
- `likes` lists each like's `id` and the `user_id` who liked it. That is
  enough to tell whether the current user liked the song, and to unlike it.
  The full [likes](#like) are at [`GET /api/songs/:id/likes`](#get-apisongsidlikes).
- `user` is the song's owner. Seeded songs belong to a library account named
  "Fortefy", which nobody can log in as.

```json
{
    "album_art": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Polygondwanaland.jpg",
    "album_id": 1,
    "album_name": "Polygondwanaland",
    "artist": "King Gizzard and the Lizard Wizard",
    "created_at": "2026-10-04T05:15:04.134Z",
    "duration": 644,
    "id": 1,
    "likes": [
        {
            "id": 1,
            "user_id": 1
        }
    ],
    "name": "Crumbling Castle",
    "song_url": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Crumbling+Castle.mp3",
    "track_number": 1,
    "updated_at": "2026-10-04T05:15:04.134Z",
    "user": {
        "id": 6,
        "username": "Fortefy"
    },
    "user_id": 6
}
```

### Like

One user's like of one song, with the user who liked it.

```json
{
    "created_at": "2026-10-04T05:15:40.252Z",
    "id": 1,
    "song_id": 1,
    "updated_at": "2026-10-04T05:15:40.252Z",
    "user": {
        "id": 1,
        "username": "Demo"
    },
    "user_id": 1
}
```

### Album

`art` is `null` when the album has none; the frontend then shows its own
default cover. `songs` are [songs](#song), in no particular order (the
frontend sorts them by `track_number`).

```json
{
    "art": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Polygondwanaland.jpg",
    "artist": "King Gizzard and the Lizard Wizard",
    "created_at": "2026-10-04T05:15:04.125Z",
    "genre": "Progressive Rock",
    "id": 1,
    "name": "Polygondwanaland",
    "songs": [
        {
            "album_art": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Polygondwanaland.jpg",
            "album_id": 1,
            "album_name": "Polygondwanaland",
            "artist": "King Gizzard and the Lizard Wizard",
            "created_at": "2026-10-04T05:15:04.134Z",
            "duration": 644,
            "id": 1,
            "likes": [
                {
                    "id": 1,
                    "user_id": 1
                }
            ],
            "name": "Crumbling Castle",
            "song_url": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/King+Gizzard+and+the+Lizard+Wizard/Polygondwanaland/Crumbling+Castle.mp3",
            "track_number": 1,
            "updated_at": "2026-10-04T05:15:04.134Z",
            "user": {
                "id": 6,
                "username": "Fortefy"
            },
            "user_id": 6
        }
    ],
    "updated_at": "2026-10-04T05:15:04.125Z",
    "user": {
        "id": 6,
        "username": "Fortefy"
    },
    "year": 2017
}
```

### Playlist

`playlist_songs` are the playlist's entries in the order they were added. Each
entry has its own `id`, which is what
[removing it](#delete-apiplaylistsplaylist_idplaylist-songsplaylist_song_iddelete)
takes, and the [song](#song) itself. The same song can be in a playlist more
than once. `art` is `null` when the playlist has none; the frontend then shows
the first song's cover.

```json
{
    "art": null,
    "created_at": "2026-10-04T05:15:04.144Z",
    "description": "Good vibes",
    "id": 1,
    "playlist_songs": [
        {
            "created_at": "2026-10-04T05:15:04.150Z",
            "id": 1,
            "playlist_id": 1,
            "song": {
                "album_art": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Climbers/Things+Gonna+Change/Things+Gonna+Change.jpg",
                "album_id": 7,
                "album_name": "Things Gonna Change",
                "artist": "The Climbers",
                "created_at": "2026-10-04T05:15:04.134Z",
                "duration": 144,
                "id": 25,
                "likes": [
                    {
                        "id": 2,
                        "user_id": 1
                    }
                ],
                "name": "She's Coming to Town",
                "song_url": "https://fortefy-song-url.s3.us-east-2.amazonaws.com/free/The+Climbers/Things+Gonna+Change/She's+Coming+to+Town.mp3",
                "track_number": 1,
                "updated_at": "2026-10-04T05:15:04.134Z",
                "user": {
                    "id": 6,
                    "username": "Fortefy"
                },
                "user_id": 6
            },
            "song_id": 25,
            "updated_at": "2026-10-04T05:15:04.150Z"
        }
    ],
    "title": "David's Playlist",
    "updated_at": "2026-10-04T05:15:04.144Z",
    "user": {
        "id": 1,
        "username": "Demo"
    },
    "user_id": 1
}
```

## Auth

### `GET /api/auth/`

The logged-in user.

- **Response:** `200` with the [current user](#current-user). Logged out, it is
  still `200`, with `{ "errors": ["Unauthorized"] }`.

### `POST /api/auth/login`

Logs in with an email address and password.

- **Body:** `email`, `password`.
- **Response:** `200` with the [current user](#current-user).
- **Errors:** `401` with `email` (`"Email provided not found."`) or `password`
  (`"Password was incorrect."`). An account made through Google has no
  password, and gets `"This account signs in with Google. Use "Continue with
  Google" instead."`

### `POST /api/auth/logout`

Logs out. A `POST`, so another site can't log people out with an image tag.

- **Response:** `200` with `{ "message": "User logged out" }`.

### `POST /api/auth/signup`

Creates an account and logs in as it.

- **Body:**

  | field | rules |
  |---|---|
  | `username` | required, 4 to 40 characters, not already taken |
  | `email` | required, a valid email address, at most 255 characters, not already taken |
  | `password` | required, at least 6 characters |

- **Response:** `200` with the [current user](#current-user).
- **Errors:** `401` with a message for each field that failed.

### `GET /api/auth/unauthorized`

Always `401` with `{ "errors": ["Unauthorized"] }`. Flask-Login's handler for
a _Login required_ route without a session; nothing calls it directly.

### `GET /api/auth/oauth/providers`

Which sign-in providers this server has credentials for, so the frontend only
shows buttons that work.

- **Response:** `200` with `{ "google": true }` or `{ "google": false }`.

### `GET /api/auth/oauth/google`

Starts Google sign-in. The browser navigates here; it is not a fetch.

- **Response:** `302` to Google's consent screen. Without Google credentials on
  the server, `302` to `/?oauth_error=<message>` instead.

### `GET /api/auth/oauth/google/callback`

Where Google sends the browser back. Logs in the account linked to that
Google account. Failing that, it links the account with the same email
address, or creates a new one.

- **Response:** `302` to `/`, logged in. On failure (cancelled, an unverified
  Google email, no credentials on the server) `302` to
  `/?oauth_error=<message>`, which the login modal shows.

## Users

Nothing in the frontend calls these yet.

### `GET /api/users/`

_Login required._ Every user.

- **Response:** `200` with `{ "users": [User, ...] }` ([User](#user)).

### `GET /api/users/:id`

_Login required._ One user.

- **Response:** `200` with the [user](#user).
- **Errors:** `404` `"User not found"`.

## Albums

The album body, for creating and editing:

| field | rules |
|---|---|
| `name` | required, at most 255 characters |
| `artist` | required, at most 50 characters |
| `year` | required, 1 to 9999 |
| `genre` | required, at most 50 characters |
| `art` | optional; an `http` or `https` URL ending in `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp` or `.svg`, at most 255 characters |

### `GET /api/albums`

Every album.

- **Response:** `200` with a list of [albums](#album).

### `GET /api/albums/:id`

One album, with its songs.

- **Response:** `200` with the [album](#album).
- **Errors:** `404` `"Album not found"`.

### `GET /api/albums/current`

_Login required._ The albums the current user created.

- **Response:** `200` with a list of [albums](#album).

### `POST /api/albums/newAlbum`

_Login required._ Creates an album owned by the current user.

- **Body:** the [album body](#albums).
- **Response:** `200` with the new [album](#album), with no songs.
- **Errors:** `400` with a message for each field that failed.

### `PUT /api/albums/edit/:id`

_Login required._ Changes one of the current user's albums.

- **Body:** the [album body](#albums), every field. Leaving `art` out or blank
  removes the album's art.
- **Response:** `200` with the [album](#album).
- **Errors:** `400` with a message for each field that failed, `403` `"Album
  does not belong to user"`, `404` `"Album not found"`.

### `DELETE /api/albums/:id/delete`

_Login required._ Deletes one of the current user's albums, its songs, every
like and playlist entry of those songs, and the uploaded audio files in S3.

- **Response:** `200` with `{ "message": "Successfully Deleted" }`.
- **Errors:** `403` `"Album does not belong to user"`, `404` `"Album not found"`.

### `POST /api/albums/:id/song`

_Login required._ Uploads a song to one of the current user's albums. The file
goes to S3, and the song's `duration` is measured from it.

- **Body:** `multipart/form-data`:

  | field | rules |
  |---|---|
  | `name` | required, at most 255 characters |
  | `track_number` | required, 1 or more |
  | `song` | required; a playable `.mp3`, `.m4a` or `.wav` file |

- **Response:** `200` with the new [song](#song).
- **Errors:**
  - `400` with a message for each field that failed, including
    `{ "song": "File is not a playable .mp3 file" }` for a file that isn't
    what its extension says.
  - `403` `"Album does not belong to user"`, `404` `"Album not found"`.
  - `413` for a file over 50 MB.
  - `502` with `{ "song": "The file could not be stored. Please try again later." }`
    when S3 refuses the upload (bad credentials, a missing bucket). The reason
    goes to the server log.

## Songs

### `GET /api/songs`

Every song.

- **Response:** `200` with a list of [songs](#song).

### `GET /api/songs/:id`

One song.

- **Response:** `200` with the [song](#song).
- **Errors:** `404` `"Song not found"`.

### `PUT /api/songs/:id`

_Login required._ Renames or renumbers one of the current user's songs. The
audio file can't be replaced.

- **Body:** `name` (required, at most 255 characters) and `track_number`
  (required, 1 or more).
- **Response:** `200` with the [song](#song).
- **Errors:** `400` with a message for each field that failed, `403` `"Song does
  not belong to user"`, `404` `"Song not found"`.

### `DELETE /api/songs/:id/delete`

_Login required._ Deletes one of the current user's songs, its likes and its
playlist entries. An uploaded file is deleted from S3 too; the seeded songs'
shared audio is left alone.

- **Response:** `200` with `{ "message": "Deleted Successfully" }`.
- **Errors:** `403` `"Song does not belong to user"`, `404` `"Song not found"`.

### `GET /api/songs/current`

_Login required._ The songs the current user uploaded.

- **Response:** `200` with a list of [songs](#song).

### `GET /api/songs/liked`

_Login required._ The songs the current user has liked, most recently liked
first. The frontend's "Liked Songs" playlist.

- **Response:** `200` with a list of [songs](#song).

### `GET /api/songs/:id/likes`

A song's likes, with who liked it.

- **Response:** `200` with a list of [likes](#like).
- **Errors:** `404` `"Song not found"`.

### `POST /api/songs/:id/add-like`

_Login required._ Likes a song as the current user.

- **Response:** `200` with the new [like](#like).
- **Errors:** `404` `"Song not found"`, `409` `"User has already liked song"`.

### `DELETE /api/songs/:id/remove-like`

_Login required._ Removes the current user's like from a song.

- **Response:** `200` with `{ "message": "Like successfully deleted" }`.
- **Errors:** `404` `"Song not found"` or `"User has not liked this song"`.

## Playlists

The playlist body, for creating and editing:

| field | rules |
|---|---|
| `title` | required, at most 60 characters |
| `description` | optional, at most 254 characters |
| `art` | optional; an `http` or `https` URL ending in `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp` or `.svg`, at most 255 characters |

### `GET /api/playlists`

Every user's playlists.

- **Response:** `200` with a list of [playlists](#playlist).

### `GET /api/playlists/:id`

One playlist, with its songs.

- **Response:** `200` with the [playlist](#playlist).
- **Errors:** `404` `"Playlist not found"`.

### `GET /api/playlists/current`

_Login required._ The current user's playlists.

- **Response:** `200` with a list of [playlists](#playlist).

### `POST /api/playlists/new`

_Login required._ Creates an empty playlist owned by the current user.

- **Body:** the [playlist body](#playlists).
- **Response:** `200` with the new [playlist](#playlist).
- **Errors:** `400` with a message for each field that failed.

### `PUT /api/playlists/:id/edit`

_Login required._ Changes one of the current user's playlists. The frontend
doesn't use it yet.

- **Body:** the [playlist body](#playlists), every field. Leaving `art` out or
  blank removes the playlist's art.
- **Response:** `200` with the [playlist](#playlist).
- **Errors:** `400` with a message for each field that failed, `403` `"Playlist
  does not belong to user"`, `404` `"Playlist not found"`.

### `DELETE /api/playlists/:id/delete`

_Login required._ Deletes one of the current user's playlists. The songs stay.

- **Response:** `200` with `{ "message": "Successfully Deleted" }`.
- **Errors:** `403` `"Playlist does not belong to user"`, `404` `"Playlist not
  found"`.

### `POST /api/playlists/:playlist_id/playlist-songs/:song_id/new`

_Login required._ Adds a song to the end of one of the current user's
playlists. Any song can be added, including one already in the playlist.

- **Response:** `200` with the whole [playlist](#playlist).
- **Errors:** `403` `"Playlist does not belong to user"`, `404` `"Playlist could
  not be found"` or `"Song could not be found"`.

### `DELETE /api/playlists/:playlist_id/playlist-songs/:playlist_song_id/delete`

_Login required._ Removes one entry from one of the current user's playlists.
It takes the entry's `id` from `playlist_songs`, not the song's, so removing one
copy of a song that appears twice leaves the other.

- **Response:** `200` with the whole [playlist](#playlist).
- **Errors:** `403` `"Playlist does not belong to user"`, `404` `"Playlist could
  not be found"` or `"Song cannot be found in Playlist"`.

## Search

### `GET /api/search`

Songs whose name or artist contains the search term, and albums whose name or
artist contains it.

- **Query:** `q`, the search term. Only its first 100 characters are used.
- **Matching:** case-insensitive. `%` and `_` match themselves rather than
  acting as wildcards. Results whose name starts with the term come first, then
  the rest alphabetically, up to 50 songs and 50 albums. A blank term returns
  empty lists.
- **Response:** `200` with `{ "songs": [Song, ...], "albums": [Album, ...] }`
  ([Song](#song), [Album](#album)).

## Docs

### `GET /api/docs`

Every route the server has, each with its methods and the docstring of the
function that handles it. A quick check of what a running server knows about;
this file is the reference.

- **Response:** `200` with `{ "<route>": [["GET"], "<docstring>"], ... }`.
