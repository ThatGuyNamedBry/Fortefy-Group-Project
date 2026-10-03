//                                           Action Types
const SET_PLAYLIST = 'player/SET_PLAYLIST';
const SET_SONG_INDEX = 'player/SET_SONG_INDEX';
const SET_IS_PLAYING = 'player/SET_IS_PLAYING';
const CLEAR_QUEUE = 'player/CLEAR_QUEUE';

//                                         Action Creators

export const setCurrentPlaylist = (currentPlaylist) => ({
    type: SET_PLAYLIST,
    payload: { currentPlaylist },
});

export const setCurrentSongIndex = (currentSongIndex) => ({
    type: SET_SONG_INDEX,
    payload: { currentSongIndex },
});

export const setIsPlaying = (isPlaying) => ({
    type: SET_IS_PLAYING,
    payload: { isPlaying },
});

// The queue ran out: nothing to show, nothing playing
export const clearQueue = () => ({
    type: CLEAR_QUEUE,
});

//                                         Reducer Function

const initialState = {
    currentPlaylist: [],
    currentSongIndex: 0,
    isPlaying: false,
};

const playerReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_PLAYLIST:
            // Not isPlaying: that follows the player's own play and pause events
            return { ...state, currentPlaylist: action.payload.currentPlaylist };
        case SET_SONG_INDEX:
            return { ...state, currentSongIndex: action.payload.currentSongIndex };
        case SET_IS_PLAYING:
            return { ...state, isPlaying: action.payload.isPlaying };
        case CLEAR_QUEUE:
            return initialState;
        default:
            return state;
    }
};

export default playerReducer;
