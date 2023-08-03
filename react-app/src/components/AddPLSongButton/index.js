import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAllPlaylistsThunk } from '../../store/playlists';
import './AddPLSong';

const AddPLSongButton = ({ songId }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.session.user);
    const playlistsObject = useSelector(state => state.playlists.allPlaylists);
    const playlists = Object.values(playlistsObject);
    useEffect(() => {
        dispatch(getCurrentUserAllPlaylistsThunk());
    }, [dispatch]);
    return (
        <div></div>
    )
};

export default AddPLSongButton;
