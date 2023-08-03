//                                           Action Types
const LOAD_PLAYLISTS = 'playlists/LOAD_PLAYLISTS';
const RECEIVE_PLAYLIST = 'playlists/RECEIVE_PLAYLIST'
const DELETE_PLAYLIST = 'playlists/DELETE_PLAYLIST';
const LOAD_PLAYLIST_SONGS = 'playlists/LOAD_PLAYLIST_SONGS'

//                                         Action Creators

// Get All Playlists Action
export const getAllPlaylistsAction = (playlists) => {
    return {
        type: LOAD_PLAYLISTS,
        payload: playlists,
    };
};

// Receive a Playlist Action
export const receivePlaylistAction = (playlist) => {
    return {
        type: RECEIVE_PLAYLIST,
        payload: playlist
    }
}

  //Delete a Playlist Action
export const deletePlaylistAction = (playlistId) => {
    return {
        type: DELETE_PLAYLIST,
        payload: playlistId,
    };
};

// Load all Songs in Playlist Action
export const loadPlaylistSongsAction = (songs) => {
    return {
        type: LOAD_PLAYLIST_SONGS,
        payload: songs,
    }
}

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

//Get Playlist by Id Thunk
export const getPlaylistByIdThunk = (playlistId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}`);
    if (response.ok) {
        const playlist = await response.json();
        dispatch(receivePlaylistAction(playlist));
        return playlist;
    }
};

//Create a Playlist Thunk
export const createPlaylistThunk = (formData) => async (dispatch) => {
    // console.log('Create playlist thunk running, this is formData : ', formData)
    formData.art = formData.art ? formData.art : 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg';
    try {
        const response = await fetch('/api/playlists/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          // console.log('After new playlist fetch, this is response : ', response)
        });
        const newPlaylist = await response.json();
        if (!response.ok) {
            throw new Error(newPlaylist)
        }
        return dispatch(receivePlaylistAction(newPlaylist));
    } catch (err) {
        return err
    }
};

//Edit/Update an Playlist Thunk
export const updatePlaylistThunk = (playlistId, formData) => async (dispatch) => {
    // console.log('Edit a playlist Thunk, this is playlistId : ', playlistId);
    try {
        const response = await fetch(`/api/playlists/${playlistId}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          // console.log('After update playlist fetch, this is response : ', response)
        });
        const updatedPlaylist = await response.json();
        if (!response.ok) {
            throw new Error(updatedPlaylist);
        }
        return dispatch(receivePlaylistAction(updatedPlaylist));
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
        const data = await response.json()
        dispatch(deletePlaylistAction(playlistId));
        return data;
    }
};

//Add a Song to a Playlist Thunk
    // Arguments = playlist Id, **SONG ID**
        // Distinction: songId from below thunk
export const addPlaylistSongThunk = (playlistId, songId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}/playlist-songs/${songId}/new`, {
        method: 'POST',
    });

    if (response.ok) {
        const updatedPlaylist = await response.json();
        dispatch(receivePlaylistAction(updatedPlaylist));
        // IF FAILS, comment OUT above line, comment IN below line
        // await dispatch(getPlaylistByIdThunk(playlistId));
        return updatedPlaylist;

    }
}

//Remove a Song from a Playlist Thunk
    // Arguments = playlist Id, **PLAYLISTSONG ID**
        // Distinction: playlistSongId from above thunk
export const removePlaylistSongThunk = (playlistId, playlistSongId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}/playlist-songs/${playlistSongId}/delete`, {
        method: 'DELETE'
    });

    if (response.ok) {
        const updatedPlaylist = await response.json();
        dispatch(receivePlaylistAction(updatedPlaylist));
        // IF FAILS, comment OUT above line, comment IN below line
        // await dispatch(getPlaylistByIdThunk(playlistId));
        return updatedPlaylist;
    }
}

//Reducer function
const initialState = {
    allPlaylists: {},
    singlePlaylist: {},
    playlistSongs: {}
}

const playlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_PLAYLISTS:
            const allPlaylistsObject = {};
            action.payload.forEach((playlist) => {
                allPlaylistsObject[playlist.id] = playlist;
            });
            return { ...state, allPlaylists: allPlaylistsObject };
        case RECEIVE_PLAYLIST:
            return { ...state, allPlaylists: { ...state.allPlaylists, [action.payload.id]: action.payload }, singlePlaylist: action.payload };
        case DELETE_PLAYLIST:
            const newPlaylists = { ...state.allPlaylists };
            delete newPlaylists[action.payload];
            return { ...state, allPlaylists: newPlaylists };
        case LOAD_PLAYLIST_SONGS:
            const playlistsSongsObject = {};
            action.payload.forEach((song) => {
                playlistsSongsObject[song.playlistSongId] = song;
            });
            return { ...state, playlistSongs: playlistsSongsObject };
        default:
            return state;
    }
};

export default playlistReducer;
