import songReducer, {
    addLikeAction,
    deleteSongAction,
    getAllSongsAction,
    getUserSongsAction,
    receiveSongsAction,
    removeAlbumSongsAction,
    removeLikeAction,
    selectAlbumSongs,
    selectUserSongs,
} from './songs';

const song = (id, fields = {}) => ({ id, name: `Song ${id}`, user_id: 1, album_id: 1, track_number: id, likes: [], ...fields });
const stateWith = (...songs) => songReducer(undefined, getAllSongsAction(songs));

describe('songs reducer', () => {
    it('starts empty', () => {
        expect(songReducer(undefined, { type: 'unknown' })).toEqual({ allSongs: {} });
    });

    it('replaces the cache with the full list', () => {
        const state = songReducer(stateWith(song(1)), getAllSongsAction([song(2)]));
        expect(Object.keys(state.allSongs)).toEqual(['2']);
    });

    it("replaces only one user's songs with that user's list", () => {
        const before = stateWith(song(1, { user_id: 1 }), song(2, { user_id: 1 }), song(3, { user_id: 2 }));
        // Song 2 was deleted somewhere else, so the server no longer lists it
        const state = songReducer(before, getUserSongsAction(1, [song(1, { user_id: 1, name: 'Renamed' })]));
        expect(Object.keys(state.allSongs).sort()).toEqual(['1', '3']);
        expect(state.allSongs[1].name).toBe('Renamed');
    });

    it('merges songs from a page into the cache', () => {
        const state = songReducer(stateWith(song(1)), receiveSongsAction([song(2)]));
        expect(Object.keys(state.allSongs).sort()).toEqual(['1', '2']);
    });

    it('deletes one song, or an album of them', () => {
        const before = stateWith(song(1, { album_id: 1 }), song(2, { album_id: 2 }), song(3, { album_id: 2 }));
        expect(Object.keys(songReducer(before, deleteSongAction(1)).allSongs).sort()).toEqual(['2', '3']);
        expect(Object.keys(songReducer(before, removeAlbumSongsAction(2)).allSongs)).toEqual(['1']);
    });

    it('adds and removes likes on the right song', () => {
        const before = stateWith(song(1), song(2));
        const liked = songReducer(before, addLikeAction(1, { id: 10, user_id: 5 }));
        expect(liked.allSongs[1].likes).toEqual([{ id: 10, user_id: 5 }]);
        expect(liked.allSongs[2]).toBe(before.allSongs[2]);

        const unliked = songReducer(liked, removeLikeAction(1, 10));
        expect(unliked.allSongs[1].likes).toEqual([]);
    });

    it('ignores a like for a song it has not cached', () => {
        const before = stateWith(song(1));
        expect(songReducer(before, addLikeAction(99, { id: 10, user_id: 5 }))).toBe(before);
        expect(songReducer(before, removeLikeAction(99, 10))).toBe(before);
    });

    it('leaves the likes alone when removing one the song does not have', () => {
        const likes = [{ id: 10, user_id: 5 }, { id: 11, user_id: 6 }];
        const state = songReducer(stateWith(song(1, { likes })), removeLikeAction(1, 99));
        expect(state.allSongs[1].likes).toEqual(likes);
    });
});

describe('song selectors', () => {
    const state = {
        songs: stateWith(song(1, { track_number: 2 }), song(2, { track_number: 1 }), song(3, { user_id: 2 })),
        albums: { allAlbums: { 1: { id: 1, songs: [{ id: 1 }, { id: 2 }, { id: 404 }] } } },
        session: { user: { id: 1 } },
    };

    it("lists an album's cached songs in track order", () => {
        expect(selectAlbumSongs(state, 1).map(s => s.id)).toEqual([2, 1]);
        expect(selectAlbumSongs(state, 999)).toEqual([]);
    });

    it("lists the logged-in user's songs", () => {
        expect(selectUserSongs(state).map(s => s.id)).toEqual([1, 2]);
        expect(selectUserSongs({ ...state, session: { user: null } })).toEqual([]);
    });
});
