/*****************  ACTION TYPES   ****************/

const LOAD_ALBUMS = 'albums/LOAD_ALBUMS';
const RECEIVE_ALBUM = 'albums/RECEIVE_ALBUM';
const DELETE_ALBUM = 'albums/DELETE_ALBUM';

/*****************  ACTION CREATORS   ****************/


// Load ALL Albums Action
export const loadAlbumsAction = (albums) => {
  return {
    type: LOAD_ALBUMS,
    albums
  };
}

//Receive ONE Album Action
export const receiveAlbumAction = (album) => {
  return {
    type: RECEIVE_ALBUM,
    album
  }
}

//Delete a Album Action
export const deleteAlbumAction = (albumId) => {
  return {
    type: DELETE_ALBUM,
    albumId,
  };
};


/*****************  THUNKS   ****************/


//Get All Albums Thunk
export const getAllAlbumsThunk = () => async (dispatch) => {
  const response = await fetch('/api/albums');
  const albums = await response.json();
  dispatch(loadAlbumsAction(albums));
  return albums;
};



//Get All Albums by Current User Thunk
export const getCurrentUserAllAlbumsThunk = () => async (dispatch) => {
  const response = await fetch('/api/albums/current');
  if (response.ok) {
    const albums = await response.json();
    dispatch(loadAlbumsAction(albums));
    return albums;
  }
};



//Get Album by ID Thunk
export const getAlbumByIdThunk = (albumId) => async (dispatch) => {
  const response = await fetch(`/api/albums/${albumId}`);
  if (response.ok) {
    const album = await response.json();
    dispatch(receiveAlbumAction(album));
    return album;
  }
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

    dispatch(receiveAlbumAction(newAlbum));
    return newAlbum;
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

    dispatch(receiveAlbumAction(updatedAlbum))
    return updatedAlbum;
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



/*****************  REDUCER FUNCTION   ****************/

const initialState = {
  allAlbums: {},
  singleAlbum: {}
}

const albumReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      const allAlbumsObject = {};
      action.albums.forEach((album) => {
        allAlbumsObject[album.id] = album;
      });
      return { ...state, allAlbums: allAlbumsObject };
    case RECEIVE_ALBUM:
      return { ...state, allAlbums: { ...state.allAlbums, [action.album.id] : action.album }, singleAlbum: { [action.album.id] : action.album } };
    case DELETE_ALBUM:
      const newAlbums = { ...state.allAlbums };
      delete newAlbums[action.albumId];
      return { ...state, allAlbums: newAlbums };
    default:
      return state;
  }
};

export default albumReducer;
