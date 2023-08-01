//                                           Action Types
const LOAD_PLAYLISTS = 'playlists/LOAD_PLAYLISTS';
const LOAD_PLAYLIST = 'playlists/LOAD_PLAYLIST';
const CREATE_PLAYLIST = 'playlists/CREATE_PLAYLIST';
const UPDATE_PLAYLIST = 'playlists/UPDATE_PLAYLIST';
const DELETE_PLAYLIST = 'playlists/DELETE_PLAYLIST';


//                                         Action Creators

// Get All Playlists Action
export const getAllPlaylistsAction = (playlists) => {
    return {
        type: LOAD_PLAYLISTS,
        payload: playlists,
    };
};

// Get Playlist By ID Action
export const getPlaylistByIdAction = (playlist) => {
    return {
        type: LOAD_PLAYLIST,
        payload: playlist,
    };
};

//Create Playlist Action
export const createPlaylistAction = (playlist) => {
    return {
        type: CREATE_PLAYLIST,
        payload: playlist,
    };
};


// Edit/Update a Playlist Action
export const updatePlaylistAction = (playlist) => {
    return {
        type: UPDATE_PLAYLIST,
        payload: playlist,
    };
};

  //Delete a Playlist Action
export const deletePlaylistAction = (playlistId) => {
    return {
        type: DELETE_PLAYLIST,
        payload: playlistId,
    };
};

  //                                             Thunks
//Get All Playlists Thunk
export const getAllPlaylistsThunk = () => async (dispatch) => {
    const response = await fetch('/api/playlists');
    const playlists = await response.json();
    dispatch(getAllPlaylistsAction(playlists));
    return playlists;
};

//Get All Playlists by Current User Thunk
export const getCurrentUserAllPlaylistsThunk = () => async (dispatch) => {
    const response = await fetch('/api/playlists/current');
    if (response.ok) {
        const playlists = await response.json();
        dispatch(getAllPlaylistsAction(playlists));
        return playlists;
    }
};

//Get Playlist by ID Thunk
export const getPlaylistByIdThunk = (playlistId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}`);
    if (response.ok) {
        const playlist = await response.json();
        dispatch(getPlaylistByIdAction(playlist));
        return playlist;
    }
};

/********* CREATE BACKEND ROUTES FOR ALL THUNKS BELOW THIS POINT ************/

//Create a Playlist Thunk
export const createPlaylistThunk = (formData) => async (dispatch) => {
    // console.log('Create playlist thunk running, this is formData : ', formData)
    try {
        const response = await fetch('/api/playlists/new-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          // console.log('After new playlist fetch, this is response : ', response)
        });
        const newPlaylist = await response.json();
        if (!response.ok) {
            throw new Error(newPlaylist)
        }
        return dispatch(createPlaylistAction(newPlaylist));
    } catch (err) {
        return err
    }
};

//Edit/Update an Playlist Thunk
export const updatePlaylistThunk = (playlist, formData) => async (dispatch) => {
    // console.log('Edit a playlist Thunk, this is playlist : ', playlist);
    try {
        const response = await fetch(`/api/playlists/${playlist.id}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          // console.log('After update playlist fetch, this is response : ', response)
        });
        const updatedPlaylist = await response.json();
        if (!response.ok) {
            throw new Error(updatedPlaylist);
        }
        return dispatch(updatePlaylistAction(updatedPlaylist));
    } catch (err) {
        return err;
    }
}

//Delete a Playlist Thunk
export const deletePlaylistThunk = (playlistId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}/delete`, {
        method: 'DELETE',
    });

    if (response.ok) {
        dispatch(deletePlaylistAction(playlistId));
        return response.json();
    }
};


//Reducer function
const initialState = {
    allPlaylists: {},
    singlePlaylist: {}
}

const playlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_PLAYLISTS:
            const allPlaylistsObject = {};
            action.payload.forEach((playlist) => {
                allPlaylistsObject[playlist.id] = playlist;
            });
            return { ...state, allPlaylists: allPlaylistsObject };
        case LOAD_PLAYLIST:
            return { ...state, singlePlaylist: { [action.payload.id]: action.payload } };
        case CREATE_PLAYLIST:
            return { ...state, allPlaylists: { ...state.allPlaylists, [action.payload.id]: action.payload } };
        case UPDATE_PLAYLIST:
            return { ...state, allPlaylists: { ...state.allPlaylists, [action.payload.id]: action.payload }, singlePlaylist: { [action.payload.id]: action.payload } };
        case DELETE_PLAYLIST:
            const newPlaylists = { ...state.allPlaylists };
            delete newPlaylists[action.payload];
            return { ...state, allPlaylists: newPlaylists };
        default:
            return state;
    }
};

export default playlistReducer;