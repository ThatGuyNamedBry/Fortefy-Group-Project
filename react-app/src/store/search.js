//                                           Action Types
const START_SEARCH = 'search/START_SEARCH';
const LOAD_SEARCH_RESULTS = 'search/LOAD_SEARCH_RESULTS';
const SEARCH_FAILED = 'search/SEARCH_FAILED';
const CLEAR_SEARCH_RESULTS = 'search/CLEAR_SEARCH_RESULTS';


//                                         Action Creators

//Start Search Action (remembers which query is in flight)
export const startSearchAction = (query) => {
  return {
    type: START_SEARCH,
    payload: query,
  };
};

//Load Search Results Action
export const loadSearchResultsAction = (query, results) => {
  return {
    type: LOAD_SEARCH_RESULTS,
    payload: { query, songs: results.songs, albums: results.albums },
  };
};

//Search Failed Action
export const searchFailedAction = (query) => {
  return {
    type: SEARCH_FAILED,
    payload: query,
  };
};

//Clear Search Results Action
export const clearSearchResultsAction = () => {
  return {
    type: CLEAR_SEARCH_RESULTS,
  };
};

//                                             Thunks
//Search Songs and Albums Thunk
export const searchThunk = (query) => async (dispatch) => {
  dispatch(startSearchAction(query));
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search request failed');
    }
    const results = await response.json();
    dispatch(loadSearchResultsAction(query, results));
    return results;
  } catch (err) {
    dispatch(searchFailedAction(query));
    return null;
  }
};


//Reducer function
const initialState = {
  query: '',
  songs: [],
  albums: [],
  isLoading: false,
  error: false,
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_SEARCH:
      return { ...state, query: action.payload, isLoading: true, error: false };
    case LOAD_SEARCH_RESULTS:
      // Results for a query the user has already typed past are out of date; drop them
      if (action.payload.query !== state.query) return state;
      return {
        ...state,
        songs: action.payload.songs,
        albums: action.payload.albums,
        isLoading: false,
        error: false,
      };
    case SEARCH_FAILED:
      if (action.payload !== state.query) return state;
      return { ...state, songs: [], albums: [], isLoading: false, error: true };
    case CLEAR_SEARCH_RESULTS:
      return initialState;
    default:
      return state;
  }
};

export default searchReducer;
