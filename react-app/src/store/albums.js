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
  const albums = await response.json();
  dispatch(getAllAlbumsAction(albums));
  return response;
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
  const response = await fetch('/api/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  // console.log('After fetch, this is the response', response)
  if (response.ok) {
    const album = await response.json();
    // console.log('If response is okay running, this is album', album)
    for (const image of formData.images) {
      if (image.url) {
        await dispatch(createImageforAlbumThunk(album, image));
      }
    }
    return album;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};

//Create Album Image Thunk
export const createImageforAlbumThunk = (album, images) => async (dispatch) => {
  // console.log('Create Image for Album Thunk, this is album and image ', album, images)
  const response = await fetch(`/api/albums/${album.id}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(images),
  });
  if (response.ok) {
    const newImage = await response.json();
    // console.log('THIS IS NEW IMAGE RESPONSE', newImage)
    album.url = newImage.url;
    dispatch(createAlbumAction(album));
    return newImage;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};

//Edit/Update an Album Thunk
export const updateAlbumThunk = (album) => async (dispatch) => {
  // console.log('Edit/Update an album Thunk, this is album  ', album);
  const response = await fetch(`/api/albums/${album.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(album),
  });

  if (response.ok) {
    const album = await response.json();
    dispatch(updateAlbumAction(album));
    return album;
  } else {
    const errorData = await response.json();
    return errorData;
  }
};

//Delete an Album Thunk
export const deleteAlbumThunk = (albumId) => async (dispatch) => {
  const response = await fetch(`/api/albums/${albumId}`, {
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
        return { ...state, singleAlbum: {[action.payload.id]: action.payload}};
      case CREATE_ALBUM:
        return {...state, allAlbums: {  ...state.allAlbums, [action.payload.id]: action.payload }};
      case UPDATE_ALBUM:
        return {...state, singleAlbum: { [action.payload.id]: action.payload}};
      case DELETE_ALBUM:
        const newAlbums = { ...state.allAlbums };
        delete newAlbums[action.payload];
        return { ...state, allAlbums: newAlbums };
      default:
        return state;
        }
      };

      export default albumReducer;
