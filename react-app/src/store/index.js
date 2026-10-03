import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import session from './session';
import albumReducer from './albums';
import songReducer from './songs';
import playlistReducer from './playlists';
import playerReducer from './player';
import searchReducer from './search';

// Exported for the tests, which build a store without the logger
export const rootReducer = combineReducers({
    session,
    albums: albumReducer,
    songs: songReducer,
    playlists: playlistReducer,
    player: playerReducer,
    search: searchReducer,
});

let enhancer;

if (process.env.NODE_ENV === 'production') {
    enhancer = applyMiddleware(thunk);
} else {
    const logger = require('redux-logger').default;
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
