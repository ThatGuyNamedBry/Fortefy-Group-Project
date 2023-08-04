import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAllPlaylistsThunk, addPlaylistSongThunk } from '../../store/playlists';
import './AddPLSong.css';

const AddPLSongButton = ({ songId }) => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.session.user);
    const playlistsObject = useSelector(state => state.playlists.allPlaylists);
    const playlists = Object.values(playlistsObject);

    const [showPlaylists, setShowPlaylists] = useState(false);



    useEffect(() => {
        dispatch(getCurrentUserAllPlaylistsThunk());
    }, [dispatch]);

    const selectPlaylistClick = (e, playlistId) => {
        e.stopPropagation();
        dispatch(addPlaylistSongThunk(playlistId, songId));
    }
    return (
        <button>
            Add
        </button>
    )
};

export default AddPLSongButton;
