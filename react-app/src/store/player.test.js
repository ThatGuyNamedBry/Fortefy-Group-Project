import playerReducer, {
    clearQueue,
    setCurrentPlaylist,
    setCurrentSongIndex,
    setIsPlaying,
} from './player';

const initial = playerReducer(undefined, { type: 'unknown' });

describe('player reducer', () => {
    it('starts with nothing queued', () => {
        expect(initial).toEqual({ currentPlaylist: [], currentSongIndex: 0, isPlaying: false });
    });

    it('queues songs without claiming they are playing', () => {
        const state = playerReducer(initial, setCurrentPlaylist([{ id: 1 }, { id: 2 }]));
        expect(state.currentPlaylist).toEqual([{ id: 1 }, { id: 2 }]);
        // The audio element reports that itself, through setIsPlaying
        expect(state.isPlaying).toBe(false);
    });

    it('moves through the queue and follows play and pause', () => {
        let state = playerReducer(initial, setCurrentSongIndex(1));
        state = playerReducer(state, setIsPlaying(true));
        expect(state).toMatchObject({ currentSongIndex: 1, isPlaying: true });
    });

    it('clears the queue when it runs out', () => {
        let state = playerReducer(initial, setCurrentPlaylist([{ id: 1 }]));
        state = playerReducer(playerReducer(state, setIsPlaying(true)), clearQueue());
        expect(state).toEqual(initial);
    });
});
