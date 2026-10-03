import { csrfHeaders } from '../csrf';
import { REQUEST_FAILED, getJson } from '../helpers';
import { receiveSongsAction, removeAlbumSongsAction } from './songs';

//                                           Action Types
const LOAD_ALBUMS = 'albums/LOAD_ALBUMS';
const LOAD_USER_ALBUMS = 'albums/LOAD_USER_ALBUMS';
const LOAD_ALBUM = 'albums/LOAD_ALBUM';
const CREATE_ALBUM = 'albums/CREATE_ALBUM';
const UPDATE_ALBUM = 'albums/UPDATE_ALBUM';
const DELETE_ALBUM = 'albums/DELETE_ALBUM';

//                                         Action Creators

// allAlbums is a cache of every album seen so far, keyed by id; pages read the
// albums they show out of it through selectors

// Every album there is (/api/albums), so it replaces the cache outright
export const getAllAlbumsAction = (albums) => {
    return {
        type: LOAD_ALBUMS,
        payload: albums,
    };
};

// One user's albums (/api/albums/current): replaces that user's entries and
// leaves everyone else's alone
export const getUserAlbumsAction = (userId, albums) => {
    return {
        type: LOAD_USER_ALBUMS,
        payload: { userId, albums },
    };
};

//Get Album by ID Action
export const getAlbumByIdAction = (album) => {
    return {
        type: LOAD_ALBUM,
        payload: album,
    };
};

//Create Album Action
export const createAlbumAction = (album) => {
    return {
        type: CREATE_ALBUM,
        payload: album,
    };
};

// Edit/Update a Album Action
export const updateAlbumAction = (album) => {
    return {
        type: UPDATE_ALBUM,
        payload: album,
    };
};

//Delete a Album Action
export const deleteAlbumAction = (albumId) => {
    return {
        type: DELETE_ALBUM,
        payload: albumId,
    };
};

// Albums arrive with their songs; caching those too means an album page
// never waits on a separate songs load before it can list them
const receiveAlbumSongs = (albums) =>
    receiveSongsAction(albums.flatMap((album) => album.songs || []));

//                                             Thunks
//Get All Albums Thunk
export const getAllAlbumsThunk = () => async (dispatch) => {
    const albums = await getJson('/api/albums');
    if (!albums.errors) {
        dispatch(receiveAlbumSongs(albums));
        dispatch(getAllAlbumsAction(albums));
    }
    return albums;
};

//Get All Albums by Current User Thunk
export const getCurrentUserAllAlbumsThunk = () => async (dispatch, getState) => {
    const albums = await getJson('/api/albums/current');
    if (!albums.errors) {
        dispatch(receiveAlbumSongs(albums));
        dispatch(getUserAlbumsAction(getState().session.user?.id, albums));
    }
    return albums;
};

//Get Album by ID Thunk
export const getAlbumByIdThunk = (albumId) => async (dispatch) => {
    const album = await getJson(`/api/albums/${albumId}`);
    if (!album.errors) {
        dispatch(receiveAlbumSongs([album]));
        dispatch(getAlbumByIdAction(album));
    }
    return album;
};

//Create an Album Thunk
export const createAlbumThunk = (formData) => async (dispatch) => {
    // console.log('Create album thunk running, this is the formData', formData)
    try {
        const response = await fetch('/api/albums/newAlbum', {
            method: 'POST',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(formData),
            // console.log('After fetch, this is the response', response)
        });
        const newAlbum = await response.json();
        if (!response.ok) {
            // Hand the { errors: { field: message } } body back so the form can show
            // it. Wrapping it in an Error used to lose it, and the form then threw
            // reading .payload.id off the Error
            return newAlbum;
        }
        return dispatch(createAlbumAction(newAlbum));
    } catch {
        // Returning the Error itself sent the form on to read .payload.id off it
        return REQUEST_FAILED;
    }
};

//Edit/Update an Album Thunk
export const updateAlbumThunk = (album, formData) => async (dispatch) => {
    // console.log('Edit/Update an album Thunk, this is album  ', album);
    try {
        const response = await fetch(`/api/albums/edit/${album.id}`, {
            method: 'PUT',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(formData),
            // console.log('After fetch, this is the response', response)
        });
        const updatedAlbum = await response.json();
        if (!response.ok) {
            return updatedAlbum;
        }
        return dispatch(updateAlbumAction(updatedAlbum));
    } catch {
        return REQUEST_FAILED;
    }
};

//Delete an Album Thunk
export const deleteAlbumThunk = (albumId) => async (dispatch) => {
    const response = await fetch(`/api/albums/${albumId}/delete`, {
        method: 'DELETE',
        headers: csrfHeaders(),
    });

    if (response.ok) {
        dispatch(deleteAlbumAction(albumId));
        dispatch(removeAlbumSongsAction(albumId));
        return response;
    }
};

//                                            Selectors

// The logged-in user's own albums. A new array each time, of the same album
// objects until one changes, so pass shallowEqual to useSelector.
export const selectUserAlbums = (state) => {
    const userId = state.session.user?.id;
    return Object.values(state.albums.allAlbums).filter((album) => album.user.id === userId);
};

const byId = (albums) => {
    const albumsObject = {};
    albums.forEach((album) => {
        albumsObject[album.id] = album;
    });
    return albumsObject;
};

//Reducer function
const initialState = {
    allAlbums: {},
};

const albumReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_ALBUMS:
            return { ...state, allAlbums: byId(action.payload) };
        case LOAD_USER_ALBUMS: {
            const { userId, albums } = action.payload;
            const others = Object.values(state.allAlbums).filter(
                (album) => album.user.id !== userId,
            );
            return { ...state, allAlbums: { ...byId(others), ...byId(albums) } };
        }
        // One album, fetched, created or edited: the latest copy replaces the
        // cached one. (LOAD_ALBUM and UPDATE_ALBUM used to write a separate
        // singleAlbum map holding only the last album, and never updated this.)
        case LOAD_ALBUM:
        case CREATE_ALBUM:
        case UPDATE_ALBUM:
            return {
                ...state,
                allAlbums: { ...state.allAlbums, [action.payload.id]: action.payload },
            };
        case DELETE_ALBUM:
            const newAlbums = { ...state.allAlbums };
            delete newAlbums[action.payload];
            return { ...state, allAlbums: newAlbums };
        default:
            return state;
    }
};

export default albumReducer;
