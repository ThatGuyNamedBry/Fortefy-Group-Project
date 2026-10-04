import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
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

if (import.meta.env.PROD) {
    enhancer = applyMiddleware(thunk);
} else {
    // Imported only here, so production builds leave the logger out entirely.
    // A CommonJS package: Vite's dev server hands its exports over as the
    // default export, while Vitest (Node) also offers them by name
    const reduxLogger = await import('redux-logger');
    const logger = reduxLogger.logger ?? reduxLogger.default.logger;
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
