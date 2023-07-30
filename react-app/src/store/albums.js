//                                           Action Types
const LOAD_ALBUMS = 'spots/LOAD_ALBUMS';
const LOAD_ALBUM = 'spots/LOAD_ALBUM';
const CREATE_ALBUM = 'spots/CREATE_ALBUM';
const UPDATE_ALBUM = 'spots/UPDATE_ALBUM';
const DELETE_ALBUM = 'spots/DELETE_ALBUM';


//                                         Action Creators

//Get All Album Action
export const getAllAlbumAction = (albums) => {
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






//Reducer function
const initialState = {
    allAlbums: {},
    singleAlbum: {}
  }

  const albumReducer = (state = initialState, action) => {
    switch (action.type) {
      case LOAD_ALBUMS:
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
