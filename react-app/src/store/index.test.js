import configureStore from '.';
import { setCurrentSongIndex } from './player';

describe('configureStore', () => {
    it('builds the development store, logger and all, and dispatches through it', async () => {
        // The logger prints every action; keep it out of the test output
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        for (const method of ['group', 'groupCollapsed', 'groupEnd']) {
            vi.spyOn(console, method).mockImplementation(() => {});
        }

        const store = configureStore();
        store.dispatch(setCurrentSongIndex(2));
        // A thunk, so redux-thunk is wired in too
        const result = await store.dispatch(async (dispatch) => dispatch(setCurrentSongIndex(3)));

        expect(Object.keys(store.getState()).sort()).toEqual([
            'albums',
            'player',
            'playlists',
            'search',
            'session',
            'songs',
        ]);
        expect(store.getState().player.currentSongIndex).toBe(3);
        expect(result).toEqual(setCurrentSongIndex(3));
        expect(log).toHaveBeenCalled();
        vi.restoreAllMocks();
    });
});
