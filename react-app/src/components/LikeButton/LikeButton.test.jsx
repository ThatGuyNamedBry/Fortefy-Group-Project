import { screen, fireEvent, waitFor } from '@testing-library/react';
import LikeButton from '.';
import { mockFetch, renderWithStore } from '../../testUtils';

const song = (fields = {}) => ({ id: 3, name: 'Highway', user_id: 9, likes: [], ...fields });

const stateWith = (user, songFields) => ({
    session: { user },
    songs: { allSongs: { 3: song(songFields) } },
});

afterEach(() => {
    delete globalThis.fetch;
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

it('is not shown to a visitor who is not logged in', () => {
    const { container } = renderWithStore(<LikeButton songId={3} />, {
        preloadedState: stateWith(null),
    });
    expect(container).toBeEmptyDOMElement();
});

it("is not shown on the user's own song", () => {
    const { container } = renderWithStore(<LikeButton songId={3} />, {
        preloadedState: stateWith({ id: 9 }),
    });
    expect(container).toBeEmptyDOMElement();
});

it('likes the song, sending the CSRF token', async () => {
    document.cookie = 'csrf_token=token-123';
    const fetchMock = mockFetch({ id: 50, user_id: 1, song_id: 3 });
    const { store } = renderWithStore(<LikeButton songId={3} />, {
        preloadedState: stateWith({ id: 1 }),
    });

    const button = screen.getByRole('button', { name: 'Like Highway' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/songs/3/add-like');
    expect(options.method).toBe('POST');
    expect(options.headers['X-CSRFToken']).toBe('token-123');
    expect(store.getState().songs.allSongs[3].likes).toHaveLength(1);
});

it('unlikes a song the user has liked', async () => {
    const fetchMock = mockFetch({ message: 'Like successfully deleted' });
    const { store } = renderWithStore(<LikeButton songId={3} />, {
        preloadedState: stateWith({ id: 1 }, { likes: [{ id: 50, user_id: 1 }] }),
    });

    const button = screen.getByRole('button', { name: 'Like Highway' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/songs/3/remove-like');
    expect(store.getState().songs.allSongs[3].likes).toEqual([]);
});

it('stays as it was when the server refuses', async () => {
    const fetchMock = mockFetch({ errors: 'User has already liked song' }, 409);
    const { store } = renderWithStore(<LikeButton songId={3} />, {
        preloadedState: stateWith({ id: 1 }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Like Highway' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(store.getState().songs.allSongs[3].likes).toEqual([]);
});
