# User Stories

## Users

### Sign Up

* As an unregistered and unauthorized user, I want to be able to sign up for the website via a sign-up form.
  * When I'm on the `/signup` page:
    * I would like to be able to enter my email, username, and preferred password on a clearly laid out form.
    * I would like the website to log me in upon successful completion of the sign-up form.
      * So that I can seamlessly access the site's functionality
  * When I enter invalid data on the sign-up form:
    * I would like the website to inform me of the validations I failed to pass, and repopulate the form with my valid entries (except my password).
    * So that I can try again without needing to refill forms I entered valid data into.

### Log in

* As a registered and unauthorized user, I want to be able to log in to the website via a log-in form.
  * When I'm on the `/login` page:
    * I would like to be able to enter my email and password on a clearly laid out form.
    * I would like the website to log me in upon successful completion of the lob-up form.
      * So that I can seamlessly access the site's functionality
  * When I enter invalid data on the log-up form:
    * I would like the website to inform me of the validations I failed to pass, and repopulate the form with my valid entries (except my password).
      * So that I can try again without needing to refill forms I entered valid data into.

### Demo User

* As an unregistered and unauthorized user, I would like an easy to find and clear button on both the `/signup` and `/login` pages to allow me to visit the site as a guest without signing up or logging in.
  * When I'm on either the `/signup` or `/login` pages:
    * I can click on a Demo User button to log me in and allow me access as a normal user.
      * So that I can test the site's features and functionality without needing to stop and enter credentials.

### Log Out

* As a logged in user, I want to log out via an easy to find log out button on the navigation bar.
  * While on any page of the site:
    * I can log out of my account and be redirected to a page displaying the home page.
      * So that I can easily log out to keep my information secure.

## Albums

### Create Albums
** As a logged in user, I want to be able to create new Albums.
  * When I'm on the `/new-music` page:
    * I can create and submit a new Album.
      * So that I can share my music with the world.

### Viewing Albums

* As a logged in _or_ logged out user, I want to be able to view a selection of the most recent Albums.
  * When I'm on the `/albums` page:
    * I can view recently added Albums.
      * So that I can discover and listen to new music.

* As a logged in _or_ logged out user, I want to be able to view a specific album and its associated songs.
  * When I'm on the `/albums/:id` page:
    * I can view the content of the album, as well as the associated songs.
      * So that I can discover and listen to those songs and add likes to the ones I enjoyed.

//
### Updating Albums

* As a logged in user, I want to be able to edit my Albums by clicking an Edit button associated with the Album on the profile page.
  * When I'm on the `/users/:id/profile` pages:
    * I can click "Edit" to make permanent changes to the Albums I have created.
      * So that I can fix any errors I make in my Albums.

### Deleting Albums

* As a logged in user, I want to be able to delete my Albums by clicking a Delete button associated with the Album on the profile page.
  * When I'm on the `/users/:id/profile` pages:
    * I can click "Delete" to permanently delete an Album I have posted.
      * So that when I realize I have an error in my Album, I can easily remove it.

## Songs

### Create Songs
** As a logged in user, I want to be able to create new Songs.
  * When I'm on the `/new-music` page:
    * I can create and submit a new song to an album or as a Single.
      * So that I can share my song with the world.

### Viewing Songs

* As a logged in _or_ logged out user, I want to be able to view a selection of random songs.
  * When I'm on the `/songs` page:
    * I can view random Songs.
      * So that I can discover and listen to new music.

* As a logged in _or_ logged out user, I want to be able to view the song currently playing on the bottom of the page.
  * When I'm on the home page:
    * I can pause and resume the current track.


### Updating Songs

* As a logged in user, I want to be able to edit my Songs by clicking an Edit button associated with the Song on the profile page.
  * When I'm on the `/users/:id/profile` page:
    * I can click "Edit" to make permanent changes to the Songs I have created.
      * So that I can fix any errors I make in my Songs.


### Deleting Songs

* As a logged in user, I want to be able to delete my Songs by clicking a Delete button associated with the Song on the user profile page.
  * When I'm on the `/users/:id/profile` page:
    * I can click "Delete" to permanently delete a Song I have posted.
      * So that when I realize I have an error in my Song, I can easily remove it.


## Playlists

### Create Playlists
** As a logged in user, I want to be able to create new Playlists.
  * When I'm on the `/new-playlist` page:
    * I can create and submit a new playlist.
      * So that I can curate my music.


### Viewing Playlists

* As a logged in _or_ logged out user, I want to be able to view a selection of random playlists.
  * When I'm on the `/playlists` page:
    * I can view random Playlists.
      * So that I can discover and listen to new music.

* As a logged in _or_ logged out user, I want to be able to view the content of the playlist and associated music.
  * When I'm on the `/playlists/:id` page:
    * You can view all the songs in the playlist.

### Updating Playlists

* As a logged in user, I want to be able to edit my Playlists by clicking an Edit button associated with the Playlist on the profile page.
  * When I'm on the `/users/:id/profile` page:
    * I can click "Edit" to make permanent changes to the Playlists I have created.
      * So that I can fix any errors I make in my Playlists.

### Deleting Playlists

* As a logged in user, I want to be able to delete my Playlists by clicking a Delete button associated with the Playlist on the user profile page.
  * When I'm on the `/users/:id/profile` page:
    * I can click "Delete" to permanently delete a Playlist I have posted.
      * So that when I no longer like the music in a playlist, I can remove it.

## Likes

### Create Likes
** As a logged in user, I want to be able to like Songs, anywhere Songs are displayed.
  * When I'm on the `/songs`, `/albums/:id`, and home page:
    * I can add likes to Songs
      * So that I can display my attitude towards the music.


### Viewing Likes

* As a logged in _or_ logged out user, I want to be able to view the number of likes for any song.
  * When I'm on the `/songs` page:
    * I can view the number of likes.

* As a logged in user, I want to be able to view if I have liked a song.
  * When I'm on the `/songs`, `/albums/:id`, and home page:
