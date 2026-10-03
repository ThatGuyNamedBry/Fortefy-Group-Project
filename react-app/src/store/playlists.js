import { csrfHeaders } from '../csrf';
import { REQUEST_FAILED, getJson } from '../helpers';
import { receiveSongsAction } from './songs';

//                                           Action Types
const LOAD_PLAYLISTS = 'playlists/LOAD_PLAYLISTS';
const LOAD_USER_PLAYLISTS = 'playlists/LOAD_USER_PLAYLISTS';
const RECEIVE_PLAYLIST = 'playlists/RECEIVE_PLAYLIST';
const DELETE_PLAYLIST = 'playlists/DELETE_PLAYLIST';
const LOAD_PLAYLIST_SONGS = 'playlists/LOAD_PLAYLIST_SONGS';

//                                         Action Creators

// Get All Playlists Action
export const getAllPlaylistsAction = (playlists) => {
    return {
        type: LOAD_PLAYLISTS,
        payload: playlists,
    };
};

// One user's playlists, from /api/playlists/current. Unlike LOAD_PLAYLISTS
// this leaves everyone else's playlists in the store alone
export const getUserPlaylistsAction = (userId, playlists) => {
    return {
        type: LOAD_USER_PLAYLISTS,
        payload: { userId, playlists },
    };
};

// Receive a Playlist Action
export const receivePlaylistAction = (playlist) => {
    return {
        type: RECEIVE_PLAYLIST,
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

// Load all Songs in Playlist Action
export const loadPlaylistSongsAction = (songs) => {
    return {
        type: LOAD_PLAYLIST_SONGS,
        payload: songs,
    };
};

//                                             Thunks
//Get All Playlists Thunk
export const getAllPlaylistsThunk = () => async (dispatch) => {
    const playlists = await getJson('/api/playlists');
    if (!playlists.errors) dispatch(getAllPlaylistsAction(playlists));
    return playlists;
};

//Get All Playlists by Current User Thunk
export const getCurrentUserAllPlaylistsThunk = () => async (dispatch, getState) => {
    const playlists = await getJson('/api/playlists/current');
    if (!playlists.errors) dispatch(getUserPlaylistsAction(getState().session.user?.id, playlists));
    return playlists;
};

//Get Playlist by Id Thunk
export const getPlaylistByIdThunk = (playlistId) => async (dispatch) => {
    const playlist = await getJson(`/api/playlists/${playlistId}`);
    if (!playlist.errors) {
        // Cached so the like buttons on the playlist page find their songs.
        // Copies, because PlaylistDetails tags these objects with a
        // playlistSongId that has no business in the songs cache.
        dispatch(
            receiveSongsAction(
                playlist.playlist_songs.map((playlistSong) => ({ ...playlistSong.song })),
            ),
        );
        dispatch(receivePlaylistAction(playlist));
    }
    return playlist;
};

//Create a Playlist Thunk
export const createPlaylistThunk = (formData) => async (dispatch) => {
    // console.log('Create playlist thunk running, this is formData : ', formData)
    try {
        const response = await fetch('/api/playlists/new', {
            method: 'POST',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(formData),
            // console.log('After new playlist fetch, this is response : ', response)
        });
        const newPlaylist = await response.json();
        if (!response.ok) {
            // Hand the { errors: { field: message } } body back so the form can
            // show it, rather than losing it inside an Error
            return newPlaylist;
        }
        dispatch(receivePlaylistAction(newPlaylist));
        return newPlaylist;
    } catch {
        // Returning the Error itself sent the form on to /playlists/undefined
        return REQUEST_FAILED;
    }
};

//Edit/Update an Playlist Thunk
export const updatePlaylistThunk = (playlistId, formData) => async (dispatch) => {
    // console.log('Edit a playlist Thunk, this is playlistId : ', playlistId);
    try {
        const response = await fetch(`/api/playlists/${playlistId}/edit`, {
            method: 'PUT',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(formData),
            // console.log('After update playlist fetch, this is response : ', response)
        });
        const updatedPlaylist = await response.json();
        if (!response.ok) {
            return updatedPlaylist;
        }
        dispatch(receivePlaylistAction(updatedPlaylist));
        // The playlist, like createPlaylistThunk, not the action: the form
        // reads .id off whatever comes back
        return updatedPlaylist;
    } catch {
        return REQUEST_FAILED;
    }
};

//Delete a Playlist Thunk
export const deletePlaylistThunk = (playlistId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}/delete`, {
        method: 'DELETE',
        headers: csrfHeaders(),
    });

    if (response.ok) {
        const data = await response.json();
        dispatch(deletePlaylistAction(playlistId));
        return data;
    }
};

//Add a Song to a Playlist Thunk
// Arguments = playlist Id, **SONG ID**
export const addPlaylistSongThunk = (playlistId, songId) => async (dispatch) => {
    const response = await fetch(`/api/playlists/${playlistId}/playlist-songs/${songId}/new`, {
        method: 'POST',
        headers: csrfHeaders(),
    });

    if (response.ok) {
        const updatedPlaylist = await response.json();
        dispatch(receivePlaylistAction(updatedPlaylist));
        return updatedPlaylist;
    }
};

//Remove a Song from a Playlist Thunk
// Arguments = playlist Id, **PLAYLISTSONG ID**
export const removePlaylistSongThunk = (playlistId, playlistSongId) => async (dispatch) => {
    const response = await fetch(
        `/api/playlists/${playlistId}/playlist-songs/${playlistSongId}/delete`,
        {
            method: 'DELETE',
            headers: csrfHeaders(),
        },
    );

    if (response.ok) {
        const updatedPlaylist = await response.json();
        dispatch(receivePlaylistAction(updatedPlaylist));
        return updatedPlaylist;
    }
};

//                                            Selectors

// The logged-in user's playlists. allPlaylists holds everyone's (the home
// page lists them all), so "yours" is always a filter over it rather than a
// second copy that could drift. Pass shallowEqual to useSelector: the array
// is new each time, but its entries are the same objects until one changes.
export const selectUserPlaylists = (state) => {
    const userId = state.session.user?.id;
    return Object.values(state.playlists.allPlaylists).filter(
        (playlist) => playlist.user_id === userId,
    );
};

//Reducer function
const initialState = {
    allPlaylists: {},
    singlePlaylist: {},
    playlistSongs: {},
};

const playlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_PLAYLISTS:
            const allPlaylistsObject = {};
            action.payload.forEach((playlist) => {
                allPlaylistsObject[playlist.id] = playlist;
            });
            return { ...state, allPlaylists: allPlaylistsObject };
        case LOAD_USER_PLAYLISTS: {
            // The server's word on this user's playlists replaces what the
            // store had for them, one deleted elsewhere included
            const { userId, playlists } = action.payload;
            const merged = {};
            Object.values(state.allPlaylists)
                .filter((playlist) => playlist.user_id !== userId)
                .forEach((playlist) => {
                    merged[playlist.id] = playlist;
                });
            playlists.forEach((playlist) => {
                merged[playlist.id] = playlist;
            });
            return { ...state, allPlaylists: merged };
        }
        case RECEIVE_PLAYLIST:
            return {
                ...state,
                allPlaylists: { ...state.allPlaylists, [action.payload.id]: action.payload },
                singlePlaylist: action.payload,
            };
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
