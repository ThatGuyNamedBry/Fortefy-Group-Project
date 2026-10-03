import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAlbumByIdThunk } from '../../store/albums';
import AlbumForm from '../AlbumForm';
import PageStatus, { useLoadStatus } from '../PageStatus';

const AlbumUpdate = () => {
    const dispatch = useDispatch();
    let { albumId } = useParams();
    const album = useSelector((state) =>
        state.albums.allAlbums[albumId] ? state.albums.allAlbums[albumId] : null,
    );

    const user = useSelector((state) => (state.session.user ? state.session.user : null));

    const status = useLoadStatus(
        useCallback(() => dispatch(getAlbumByIdThunk(albumId)), [dispatch, albumId]),
    );

    if (status === 'missing' || !album) return <PageStatus status={status} thing="album" />;

    // Logged out, there is no user to compare against
    if (user && album.user.id === user.id) {
        return Object.keys(album).length > 1 && <AlbumForm album={album} formType="Update Album" />;
    } else {
        return <h1>You do not have permission to do that.</h1>;
    }
};

export default AlbumUpdate;
