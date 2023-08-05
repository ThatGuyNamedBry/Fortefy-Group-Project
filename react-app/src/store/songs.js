/*****************  ACTION TYPES   ****************/

const LOAD_SONGS = 'songs/LOAD_SONGS';
const RECEIVE_SONG = 'songs/RECEIVE_SONG'
const DELETE_SONG = 'songs/DELETE_SONG';

/*****************  ACTION CREATORS   ****************/

//Load ALL Songs Action
export const loadSongsAction = (songs) => {
  return {
    type: LOAD_SONGS,
    songs
  };
};

//Receive ONE Action
export const receiveSongAction = (song) => {
  return {
    type: RECEIVE_SONG,
    song
  };
};

//Delete a Song Action
export const deleteSongAction = (songId) => {
  return {
    type: DELETE_SONG,
    songId
  };
};

/*****************  THUNKS   ****************/


//Get All Songs Thunk
export const getAllSongsThunk = () => async (dispatch) => {
  const response = await fetch('/api/songs');
  const songs = await response.json();
  dispatch(loadSongsAction(songs));
  return songs;
};



//Get All Songs by Current User Thunk
export const getCurrentUserAllSongsThunk = () => async (dispatch) => {
  const response = await fetch('/api/songs/current');
  if (response.ok) {
    const songs = await response.json();
    dispatch(loadSongsAction(songs));
    return songs;
  }
};



//Get Song by ID Thunk
export const getSongByIdThunk = (songId) => async (dispatch) => {
  const response = await fetch(`/api/songs/${songId}`);
  if (response.ok) {
    const song = await response.json();
    dispatch(receiveSongAction(song));
    return song;
  }
};



//Create a Song Thunk
export const createSongThunk = (album, formData) => async (dispatch) => {
  // console.log('Create song thunk running, this is the formData', formData)
  const response = await fetch(`/api/albums/${album.id}/song`, {
    method: 'POST',
    body: formData,
  });
  // console.log('After fetch, this is the response', response)
  if (response.ok) {
    const song = await response.json();
    // console.log('If response is okay running, this is song', song)
    dispatch(receiveSongAction(song))
    return song;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};



//Edit/Update a song Thunk
export const updateSongThunk = (song, formData) => async (dispatch) => {
  // console.log('Edit/Update an song Thunk, this is song  ', song);
  const response = await fetch(`/api/songs/${song.id}`, {
    method: 'PUT',
    body: formData
  });

  if (response.ok) {
    const song = await response.json();
    dispatch(receiveSongAction(song));
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
  });

  if (response.ok) {
    dispatch(deleteSongAction(songId));
    return response.json();
  }
};



//Add a Like Thunk
export const addLikeThunk = (song) => async (dispatch) => {
    const response = await fetch(`/api/songs/${song.id}/add-like`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const newLike = await response.json();
      const updatedSong = { ...song };
      updatedSong.likes.push(newLike);
      dispatch(receiveSongAction(updatedSong));
      return newLike;
    }
};



//Remove a Like Thunk
export const removeLikeThunk = (song, likeId, index) => async (dispatch) => {
  const response = await fetch(`/api/songs/${likeId}/remove-like`, {
    method: 'PUT'
  });

  if (response.ok) {
    const updatedSong = { ...song };
    updatedSong.likes.splice(index, 1);
    dispatch(receiveSongAction(updatedSong));
    return updatedSong;
  }
}


/*****************  REDUCER FUNCTION   ****************/


const initialState = {
    allSongs: {},
    singleSong: {}
  }

  const songReducer = (state = initialState, action) => {
    switch (action.type) {
      case LOAD_SONGS:
        const allSongsObject = {};
        action.songs.forEach((song) => {
          allSongsObject[song.id] = song;
        });
        return { ...state, allSongs: allSongsObject };
      case RECEIVE_SONG:
        return { ...state, allSongs: { ...state.allSongs, [action.song.id] : action.song }, singleSong: { [action.song.id]: action.song } };
      case DELETE_SONG:
        const newSongs = { ...state.allSongs };
        delete newSongs[action.songId];
        return { ...state, allSongs: newSongs };
      default:
        return state;
        }
      };

      export default songReducer;
