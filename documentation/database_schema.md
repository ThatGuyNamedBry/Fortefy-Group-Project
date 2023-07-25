# **Database Schema**

## `users`
| Users       | data type | details                   |
|-------------|-----------|---------------------------|
| id          | integer   | not null, primary key     |
| username    | string    | not null,                 |
| email       | string    | not null, indexed, unique |
| password    | string    | not null                  |
| created_at  | datetime  | not null                  |
| updated-at  | datetime  | not null                  |

| rship name  | table     | back_populates        |
|-------------|-----------|-----------------------|
| albums      | albums    | user                  |
| songs       | songs     | user                  |
| likes       | likes     | user                  |
| playlists   | playlist  | user                  |


## `albums`
| column name | data type | details               |
|-------------|-----------|-----------------------|
| id          | integer   | not null, primary key |
| album_name  | string    | not null              |
| userId      | integer   | not null, foreign key |
| album_art   | string    |                       |
| artist      | string    | not null              |
| year        | integer   | not null              |
| genre       | string    | not null              |
| created_at  | datetime  | not null              |
| updated-at  | datetime  | not null              |

| rship name  | table     | back_populates        |
|-------------|-----------|-----------------------|
| user        | users     | albums                |
| songs       | album     | album                 |



## `songs`
| column name | data type | details               |
|-------------|-----------|-----------------------|
| id          | integer   | not null, primary key |
| song_name   | string    | not null              |
| userId      | integer   | not null, foreign key |
| albumId     | integer   | not null, foreign key |
| duration    | integer   | not null              | (int to convert later?)
| created_at  | datetime  | not null              |
| updated-at  | datetime  | not null              |

| rship name  | table     | back_populates        |
|-------------|-----------|-----------------------|
| user        | users     | songs                 |
| album       | albums    | songs                 |
| likes       | likes     | song                  |


## `likes`
| column name | data type | details               |
|-------------|-----------|-----------------------|
| songId      | integer   | not null, foreign key |
| userId      | integer   | not null, foreign key |

| rship name  | table     | back_populates        |
|-------------|-----------|-----------------------|
| user        | users     | likes                 |
| song        | songs     | likes                 |


## `playlist`

| column name | data type | details               |
|-------------|-----------|-----------------------|
| id          | integer   | not null, primary key |
| userId      | integer   | not null, foreign key |
| title       | string    | not null              |
| art         | string?   | not null              |
| description | string    |                       |

| rship  name | table     | back_populates        |
|-------------|-----------|-----------------------|
| user        | users     | playlists             |
| playlist_songs| playlist_songs | playlist       |



## `playlist-songs` (Join Table)
| column name | data type | details               |
|-------------|-----------|-----------------------|
| songId      | integer   | not null, foreign key |
| playlistId  | integer   | not null, foreign key |
| created_at  | datetime  | not null              |
| updated-at  | datetime  | not null              |

| rship  name | table     | back_populates        |
|-------------|-----------|-----------------------|
| user        | users     | playlists             |
| song        | songs     | playlists             |
| playlist    | playlists | playlist_songs        |
