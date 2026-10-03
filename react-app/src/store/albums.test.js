import albumReducer, {
    createAlbumAction,
    deleteAlbumAction,
    getAlbumByIdAction,
    getAllAlbumsAction,
    getUserAlbumsAction,
    updateAlbumAction,
} from './albums';

const album = (id, fields = {}) => ({ id, name: `Album ${id}`, user: { id: 1 }, songs: [], ...fields });
const stateWith = (...albums) => albumReducer(undefined, getAllAlbumsAction(albums));

describe('albums reducer', () => {
    it('replaces the cache with the full list', () => {
        const state = albumReducer(stateWith(album(1)), getAllAlbumsAction([album(2)]));
        expect(Object.keys(state.allAlbums)).toEqual(['2']);
    });

    it("replaces only one user's albums with that user's list", () => {
        const before = stateWith(album(1), album(2), album(3, { user: { id: 2 } }));
        const state = albumReducer(before, getUserAlbumsAction(1, [album(2)]));
        expect(Object.keys(state.allAlbums).sort()).toEqual(['2', '3']);
    });

    it.each([
        ['loaded', getAlbumByIdAction],
        ['created', createAlbumAction],
        ['updated', updateAlbumAction],
    ])('caches an album that was %s, replacing the old copy', (_, action) => {
        const state = albumReducer(stateWith(album(1)), action(album(1, { name: 'New' })));
        expect(state.allAlbums[1].name).toBe('New');
    });

    it('deletes an album', () => {
        const state = albumReducer(stateWith(album(1), album(2)), deleteAlbumAction(1));
        expect(Object.keys(state.allAlbums)).toEqual(['2']);
    });
});
