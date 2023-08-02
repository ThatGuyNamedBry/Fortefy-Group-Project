//                                           Action Types
const LOAD_SONGS = 'songs/LOAD_SONGS';
const LOAD_SONG = 'songs/LOAD_SONG';
const CREATE_SONG = 'songs/CREATE_SONG';
const UPDATE_SONG = 'songs/UPDATE_SONG';
const DELETE_SONG = 'songs/DELETE_SONG';
const ADD_LIKE = 'songs/ADD_LIKE';
const REMOVE_LIKE = 'songs/REMOVE_LIKE';


//                                         Action Creators

//Get All Songs Action
export const getAllSongsAction = (songs) => {
  return {
    type: LOAD_SONGS,
    payload: songs,
  };
};

//Get Song by ID Action
export const getSongByIdAction = (song) => {
  return {
    type: LOAD_SONG,
    payload: song,
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
  const response = await fetch('/api/songs');
  const songs = await response.json();
  dispatch(getAllSongsAction(songs));
  return response;
};

//Get All Songs by Current User Thunk
export const getCurrentUserAllSongsThunk = () => async (dispatch) => {
  const response = await fetch('/api/songs/current');
  const songs = await response.json();
  dispatch(getAllSongsAction(songs));
  return response;
};

//Get Song by ID Thunk
export const getSongByIdThunk = (songId) => async (dispatch) => {
  const response = await fetch(`/api/songs/${songId}`);
  const song = await response.json();
  dispatch(getSongByIdAction(song));
  return response;
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
    dispatch(createSongAction(song))
    return song;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};

//Edit/Update a song Thunk
export const updateSongThunk = (song) => async (dispatch) => {
  // console.log('Edit/Update an song Thunk, this is song  ', song);
  const response = await fetch(`/api/songs/${song.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
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

//Delete a Spot Thunk
export const deleteSpotThunk = (songId) => async (dispatch) => {
  const response = await fetch(`/api/songs/${songId}/delete`, {
    method: 'DELETE',
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
      headers: {
        "Content-Type": "application/json"
      }
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
    method: 'DELETE'
  });

  if (response.ok) {
    dispatch(removeLikeAction(songId, likeId))
  }
}


//Reducer function
const initialState = {
    allSongs: {},
    singleSong: {}
  }

  const songReducer = (state = initialState, action) => {
    switch (action.type) {
      case LOAD_SONGS:
        // console.log(action.payload);
        const allSongsObject = {};
        action.payload.forEach((song) => {
          allSongsObject[song.id] = song;
        });
        return { ...state, allSongs: allSongsObject };
      case LOAD_SONG:
        return { ...state, singleSong: {[action.payload.id]: action.payload}};
      case CREATE_SONG:
        return {...state, allSongs: {  ...state.allSongs, [action.payload.id]: action.payload }};
      case UPDATE_SONG:
        return {...state, singleSong: { [action.payload.id]: action.payload}};
      case DELETE_SONG:
        const newSongs = { ...state.allSongs };
        delete newSongs[action.payload];
        return { ...state, allSongs: newSongs };
      case ADD_LIKE:
        const songLikesAdded = [...state.allSongs[action.songId].likes, action.like];
        return { ...state, allSongs: { ...state.allSongs, [action.songId]: { ...state.allSongs[action.songId], likes: [...songLikesAdded] } } }
      case REMOVE_LIKE:
        const currentLikes = [...state.allSongs[action.songId].likes];
        const deleteLike = currentLikes.find(like => like.id === action.likeId);
        const ind = currentLikes.indexOf(deleteLike);
        const removedLikes = [...currentLikes.slice(0, ind), ...currentLikes.slice(ind + 1)];
        return { ...state, allSongs: { ...state.allSongs, [action.songId]: { ...state.allSongs[action.songId], likes: [...removedLikes] } } }
      default:
        return state;
        }
      };

      export default songReducer;
