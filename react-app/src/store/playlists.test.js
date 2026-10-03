import playlistReducer, {
    deletePlaylistAction,
    getAllPlaylistsAction,
    getUserPlaylistsAction,
    loadPlaylistSongsAction,
    receivePlaylistAction,
    selectUserPlaylists,
} from './playlists';

const playlist = (id, fields = {}) => ({
    id,
    title: `Playlist ${id}`,
    user_id: 1,
    playlist_songs: [],
    ...fields,
});
const stateWith = (...playlists) => playlistReducer(undefined, getAllPlaylistsAction(playlists));

describe('playlists reducer', () => {
    it('starts empty', () => {
        expect(playlistReducer(undefined, { type: 'unknown' })).toEqual({
            allPlaylists: {},
            singlePlaylist: {},
            playlistSongs: {},
        });
    });

    it("replaces only one user's playlists with that user's list", () => {
        const before = stateWith(playlist(1), playlist(2), playlist(3, { user_id: 2 }));
        // Playlist 2 was deleted in another tab
        const state = playlistReducer(before, getUserPlaylistsAction(1, [playlist(1)]));
        expect(Object.keys(state.allPlaylists).sort()).toEqual(['1', '3']);
    });

    it('caches a received playlist and makes it the open one', () => {
        const state = playlistReducer(
            stateWith(playlist(1)),
            receivePlaylistAction(playlist(1, { title: 'New' })),
        );
        expect(state.allPlaylists[1].title).toBe('New');
        expect(state.singlePlaylist.title).toBe('New');
    });

    it('deletes a playlist', () => {
        const state = playlistReducer(stateWith(playlist(1), playlist(2)), deletePlaylistAction(2));
        expect(Object.keys(state.allPlaylists)).toEqual(['1']);
    });

    it('keeps both copies of a song that is on a playlist twice', () => {
        const songs = [
            { id: 7, name: 'Twice', playlistSongId: 1 },
            { id: 7, name: 'Twice', playlistSongId: 2 },
        ];
        const state = playlistReducer(undefined, loadPlaylistSongsAction(songs));
        expect(Object.keys(state.playlistSongs)).toEqual(['1', '2']);
    });
});

it("selects the logged-in user's playlists", () => {
    const state = {
        playlists: stateWith(playlist(1), playlist(2, { user_id: 2 })),
        session: { user: { id: 1 } },
    };
    expect(selectUserPlaylists(state).map((p) => p.id)).toEqual([1]);
});
