import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAllPlaylistsThunk, addPlaylistSongThunk } from '../../store/playlists';
import './AddPLSong.css';

const AddPLSongButton = ({ songId, userId }) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const playlistsObject = useSelector(state => state.playlists.allPlaylists);
    const playlists = Object.values(playlistsObject);

    const [showOptions, setShowOptions] = useState('none');

    useEffect(() => {
        dispatch(getCurrentUserAllPlaylistsThunk());
    }, [dispatch]);

    const onPlusClick = (e) => {
        e.stopPropagation();
        setShowOptions(showOptions === 'none' ? 'block' : 'none');
    };

    const onPlaylistSelect = (e) => {
        e.stopPropagation();
        setShowOptions('none');

        if (e.target.value === "Create Playlist") {
            history.push('/playlists/new');
        } else {
            dispatch(addPlaylistSongThunk(e.target.value, songId));
        }
    }

    if (!userId) {
        return null;
    }

    return (
        <div id='open-playlist-select-button'>
            <i
                id='plus-playlist-song'
                className="fa-solid fa-circle-plus"
                onClick={onPlusClick}
            ></i>
            <div className='custom-select playlist-options-container' style={{display : showOptions }}>
                <select
                    className="user-playlists-select"
                    style={{visibility : showOptions }}
                    onChange={onPlaylistSelect}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option
                        className="playlist-options"
                        id="create-playlist-option"
                        value="Create Playlist"
                    >Create Playlist
                    </option>
                    {playlists.map(playlist => (
                        <option
                            key={playlist.id}
                            className='playlist-options'
                            value={playlist.id}
                        >{playlist.title}</option>
                    ))}
                </select>
            </div>
        </div>
    )
};

export default AddPLSongButton;
