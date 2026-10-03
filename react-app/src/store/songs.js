import { csrfHeaders } from '../csrf';
import { getJson } from '../helpers';

//                                           Action Types
const LOAD_SONGS = 'songs/LOAD_SONGS';
const LOAD_USER_SONGS = 'songs/LOAD_USER_SONGS';
const RECEIVE_SONGS = 'songs/RECEIVE_SONGS';
const REMOVE_ALBUM_SONGS = 'songs/REMOVE_ALBUM_SONGS';
const CREATE_SONG = 'songs/CREATE_SONG';
const UPDATE_SONG = 'songs/UPDATE_SONG';
const DELETE_SONG = 'songs/DELETE_SONG';
const ADD_LIKE = 'songs/ADD_LIKE';
const REMOVE_LIKE = 'songs/REMOVE_LIKE';


//                                         Action Creators

// allSongs is a cache of every song seen so far, keyed by id. Pages read the
// songs they show out of it through selectors rather than each loading "their"
// list into it, so the like button finds its song on any page.

// Every song there is (/api/songs), so it replaces the cache outright
export const getAllSongsAction = (songs) => {
  return {
    type: LOAD_SONGS,
    payload: songs,
  };
};

// One user's songs (/api/songs/current): replaces that user's entries, a song
// deleted elsewhere included, and leaves everyone else's alone
export const getUserSongsAction = (userId, songs) => {
  return {
    type: LOAD_USER_SONGS,
    payload: { userId, songs },
  };
};

// Any other handful of songs (an album's, a playlist's, liked songs, search
// results): merged in, never replacing what is already there
export const receiveSongsAction = (songs) => {
  return {
    type: RECEIVE_SONGS,
    payload: songs,
  };
};

// Deleting an album deletes its songs on the server too
export const removeAlbumSongsAction = (albumId) => {
  return {
    type: REMOVE_ALBUM_SONGS,
    payload: albumId,
  };
};

//Create Song Action
export const createSongAction = (song) => {
  return {
    type: CREATE_SONG,
    payload: song,
  };
};


// Edit/Update a Song Action
export const updateSongAction = (song) => {
  return {
    type: UPDATE_SONG,
    payload: song,
  };
};

//Delete a Song Action
export const deleteSongAction = (songId) => {
  return {
    type: DELETE_SONG,
    payload: songId,
  };
};

//Add a Like Action
export const addLikeAction = (songId, like) => {
  return {
    type: ADD_LIKE,
    songId,
    like
  }
}

//Remove a Like Action
export const removeLikeAction = (songId, likeId) => {
  return {
    type: REMOVE_LIKE,
    songId,
    likeId
  }
}

//                                             Thunks
//Get All Songs Thunk
export const getAllSongsThunk = () => async (dispatch) => {
  const songs = await getJson('/api/songs');
  if (!songs.errors) dispatch(getAllSongsAction(songs));
  return songs;
};

//Get All Songs by Current User Thunk
export const getCurrentUserAllSongsThunk = () => async (dispatch, getState) => {
  const songs = await getJson('/api/songs/current');
  if (!songs.errors) dispatch(getUserSongsAction(getState().session.user?.id, songs));
  return songs;
};

//Get Current User's Liked Songs Thunk
export const getLikedSongsThunk = () => async (dispatch) => {
  const songs = await getJson('/api/songs/liked');
  if (!songs.errors) dispatch(receiveSongsAction(songs));
  return songs;
};

//Get Song by ID Thunk
export const getSongByIdThunk = (songId) => async (dispatch) => {
  const song = await getJson(`/api/songs/${songId}`);
  if (!song.errors) dispatch(receiveSongsAction([song]));
  return song;
};

//Create a Song Thunk
export const createSongThunk = (album, formData) => async (dispatch) => {
  let response;
  try {
    response = await fetch(`/api/albums/${album.id}/song`, {
      method: 'POST',
      headers: csrfHeaders(),
      body: formData,
    });
  } catch {
    // No response at all: offline, or the connection dropped mid-upload
    return { errors: 'The upload was interrupted. Check your connection and try again.' };
  }

  if (response.ok) {
    const song = await response.json();
    dispatch(createSongAction(song))
    return song;
  } else {
    // An error page from something in front of Flask (a proxy, a gateway
    // timeout) is HTML, not our JSON
    return response.json().catch(() => ({ errors: `Upload failed (error ${response.status}). Please try again.` }));
  }
};

//Edit/Update a song Thunk
export const updateSongThunk = (song, formData) => async (dispatch) => {
  // console.log('Edit/Update an song Thunk, this is song  ', song);
  const response = await fetch(`/api/songs/${song.id}`, {
    method: 'PUT',
    headers: csrfHeaders(),
    body: formData
  });

  if (response.ok) {
    const song = await response.json();
    dispatch(updateSongAction(song));
    return song;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};

//Delete a Song Thunk
export const deleteSongThunk = (songId) => async (dispatch) => {
  const response = await fetch(`/api/songs/${songId}/delete`, {
    method: 'DELETE',
    headers: csrfHeaders(),
  });

  if (response.ok) {
    dispatch(deleteSongAction(songId));
    return response;
  }
};

//Add a Like Thunk
export const addLikeThunk = (songId) => async (dispatch) => {
    const response = await fetch(`/api/songs/${songId}/add-like`, {
      method: 'POST',
      headers: csrfHeaders({
        "Content-Type": "application/json"
      })
    });

    if (response.ok) {
      const newLike = await response.json();
      dispatch(addLikeAction(songId, newLike));
      return newLike;
    }
};

//Remove a Like Thunk
export const removeLikeThunk = (songId, likeId) => async (dispatch) => {
  const response = await fetch(`/api/songs/${songId}/remove-like`, {
    method: 'DELETE',
    headers: csrfHeaders(),
  });

  if (response.ok) {
    dispatch(removeLikeAction(songId, likeId))
  }
}


//                                            Selectors
// Each returns a new array, but of the same song objects until one of them
// changes, so pass shallowEqual to useSelector.

// An album's songs in track order, as currently cached (likes included)
export const selectAlbumSongs = (state, albumId) => {
  const album = state.albums.allAlbums[albumId];
  if (!album) return [];
  return album.songs
    .map(song => state.songs.allSongs[song.id])
    .filter(Boolean)
    .sort((song1, song2) => song1.track_number - song2.track_number);
};

// The logged-in user's own songs
export const selectUserSongs = (state) => {
  const userId = state.session.user?.id;
  return Object.values(state.songs.allSongs).filter(song => song.user_id === userId);
};

const byId = (songs) => {
  const songsObject = {};
  songs.forEach((song) => { songsObject[song.id] = song; });
  return songsObject;
};

//Reducer function
const initialState = {
    allSongs: {},
  }

  const songReducer = (state = initialState, action) => {
    switch (action.type) {
      case LOAD_SONGS:
        return { ...state, allSongs: byId(action.payload) };
      case LOAD_USER_SONGS: {
        const { userId, songs } = action.payload;
        const others = Object.values(state.allSongs).filter(song => song.user_id !== userId);
        return { ...state, allSongs: { ...byId(others), ...byId(songs) } };
      }
      case RECEIVE_SONGS:
        return { ...state, allSongs: { ...state.allSongs, ...byId(action.payload) } };
      case CREATE_SONG:
        return {...state, allSongs: {  ...state.allSongs, [action.payload.id]: action.payload }};
      case UPDATE_SONG:
        return { ...state, allSongs: { ...state.allSongs, [action.payload.id]: action.payload } }
      case DELETE_SONG:
        const newSongs = { ...state.allSongs };
        delete newSongs[action.payload];
        return { ...state, allSongs: newSongs };
      case REMOVE_ALBUM_SONGS:
        return { ...state, allSongs: byId(Object.values(state.allSongs).filter(song => song.album_id !== action.payload)) };
      case ADD_LIKE:
        // Every page caches the songs it shows, but a like for one that is not
        // cached should be a no-op rather than a TypeError
        if (!state.allSongs[action.songId]) return state;
        const songLikesAdded = [...state.allSongs[action.songId].likes, action.like];
        return { ...state, allSongs: { ...state.allSongs, [action.songId]: { ...state.allSongs[action.songId], likes: [...songLikesAdded] } } }
      case REMOVE_LIKE:
        if (!state.allSongs[action.songId]) return state;
        // By id. Finding its index and slicing around it turned a like the
        // song doesn't have (index -1) into a duplicate of the others
        const removedLikes = state.allSongs[action.songId].likes.filter(like => like.id !== action.likeId);
        return { ...state, allSongs: { ...state.allSongs, [action.songId]: { ...state.allSongs[action.songId], likes: removedLikes } } }
      default:
        return state;
        }
      };

      export default songReducer;
