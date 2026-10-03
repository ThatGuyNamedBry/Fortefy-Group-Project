import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AlbumForm from '.';
import { mockFetch, renderWithStore } from '../../testUtils';

const fill = (fields) => {
    Object.entries(fields).forEach(([label, value]) => {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });
};

const validAlbum = {
    'Artist*': 'The Testers',
    'Album Name*': 'Debut',
    'Genre*': 'Pop',
    'Year*': '2024',
};

afterEach(() => {
    delete global.fetch;
});

it('does not submit when Cancel is pressed', () => {
    const fetchMock = mockFetch({});
    const { location } = renderWithStore(<AlbumForm formType="Create Album" />, {
        history: ['/profile', '/albums/new'],
    });
    fill(validAlbum);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/profile');
});

it('checks the fields before sending anything', () => {
    const fetchMock = mockFetch({});
    renderWithStore(<AlbumForm formType="Create Album" />);
    fill({ ...validAlbum, 'Album Name*': '', 'Album art': 'https://example.com/cover.txt' });

    fireEvent.click(screen.getByRole('button', { name: 'Create Album' }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Fields with * are required.')).toBeInTheDocument();
    expect(screen.getByText(/Image URL must end in/)).toBeInTheDocument();
});

it("shows the server's errors beside their fields", async () => {
    mockFetch({ errors: { name: 'Field cannot be longer than 255 characters.' } }, 400);
    const { location } = renderWithStore(<AlbumForm formType="Create Album" />, {
        history: ['/albums/new'],
    });
    fill(validAlbum);

    fireEvent.click(screen.getByRole('button', { name: 'Create Album' }));

    expect(
        await screen.findByText('Field cannot be longer than 255 characters.'),
    ).toBeInTheDocument();
    expect(location.pathname).toBe('/albums/new');
});

it('opens the new album once it is created', async () => {
    const fetchMock = mockFetch({ id: 12, name: 'Debut', art: null, user: { id: 1 }, songs: [] });
    const { location, store } = renderWithStore(<AlbumForm formType="Create Album" />, {
        history: ['/albums/new'],
    });
    fill(validAlbum);

    fireEvent.click(screen.getByRole('button', { name: 'Create Album' }));

    await waitFor(() => expect(location.pathname).toBe('/albums/12'));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        artist: 'The Testers',
        name: 'Debut',
        genre: 'Pop',
        year: '2024',
        art: '',
    });
    expect(store.getState().albums.allAlbums[12].name).toBe('Debut');
});

it('shows an album without art as an empty art field', () => {
    renderWithStore(
        <AlbumForm
            formType="Update Album"
            album={{ id: 3, artist: 'A', name: 'B', genre: 'C', year: 2020, art: null }}
        />,
    );

    expect(screen.getByLabelText('Album art')).toHaveValue('');
    expect(screen.getByLabelText('Album Name*')).toHaveValue('B');
});
