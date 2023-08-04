//                                           Action Types
const LOAD_ALBUMS = 'albums/LOAD_ALBUMS';
const LOAD_ALBUM = 'albums/LOAD_ALBUM';
const CREATE_ALBUM = 'albums/CREATE_ALBUM';
const UPDATE_ALBUM = 'albums/UPDATE_ALBUM';
const DELETE_ALBUM = 'albums/DELETE_ALBUM';


//                                         Action Creators

//Get All Album Action
export const getAllAlbumsAction = (albums) => {
  return {
    type: LOAD_ALBUMS,
    payload: albums,
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

//                                             Thunks
//Get All Albums Thunk
export const getAllAlbumsThunk = () => async (dispatch) => {
  const response = await fetch('/api/albums');
  const albums = await response.json();
  dispatch(getAllAlbumsAction(albums));
  return response;
};

//Get All Albums by Current User Thunk
export const getCurrentUserAllAlbumsThunk = () => async (dispatch) => {
  const response = await fetch('/api/albums/current');
  if (response.ok) {
    const albums = await response.json();
    dispatch(getAllAlbumsAction(albums));
    return albums;
  }
};

//Get Album by ID Thunk
export const getAlbumByIdThunk = (albumId) => async (dispatch) => {
  const response = await fetch(`/api/albums/${albumId}`);
  const album = await response.json();
  dispatch(getAlbumByIdAction(album));
  return response;
};

//Create an Album Thunk
export const createAlbumThunk = (formData) => async (dispatch) => {
  // console.log('Create album thunk running, this is the formData', formData)
  try {
    const response = await fetch('/api/albums/newAlbum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      // console.log('After fetch, this is the response', response)
    });
    const newAlbum = await response.json();
    if (!response.ok) {
      throw new Error(newAlbum)
    }
    return dispatch(createAlbumAction(newAlbum))
  } catch (err) {
    return err
  }
};

//Edit/Update an Album Thunk
export const updateAlbumThunk = (album, formData) => async (dispatch) => {
  // console.log('Edit/Update an album Thunk, this is album  ', album);
  try {
    const response = await fetch(`/api/albums/edit/${album.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      // console.log('After fetch, this is the response', response)
    });
    const updatedAlbum = await response.json();
    if (!response.ok) {
      throw new Error(updatedAlbum)
    }
    return dispatch(updateAlbumAction(updatedAlbum))
  } catch (err) {
    return err
  }
}

//Delete an Album Thunk
export const deleteAlbumThunk = (albumId) => async (dispatch) => {
  const response = await fetch(`/api/albums/${albumId}/delete`, {
    method: 'DELETE',
  });

  if (response.ok) {
    dispatch(deleteAlbumAction(albumId));
    return response;
  }
};


//Reducer function
const initialState = {
  allAlbums: {},
  singleAlbum: {}
}

const albumReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      // console.log(action.payload);
      const allAlbumsObject = {};
      action.payload.forEach((album) => {
        allAlbumsObject[album.id] = album;
      });
      return { ...state, allAlbums: allAlbumsObject };
    case LOAD_ALBUM:
      return { ...state, singleAlbum: { [action.payload.id]: action.payload } };
    case CREATE_ALBUM:
      return { ...state, allAlbums: { ...state.allAlbums, [action.payload.id]: action.payload } };
    case UPDATE_ALBUM:
      return { ...state, singleAlbum: { [action.payload.id]: action.payload } };
    case DELETE_ALBUM:
      const newAlbums = { ...state.allAlbums };
      delete newAlbums[action.payload];
      return { ...state, allAlbums: newAlbums };
    default:
      return state;
  }
};

export default albumReducer;
