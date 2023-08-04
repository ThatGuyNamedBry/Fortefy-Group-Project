import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAllPlaylistsThunk, addPlaylistSongThunk } from '../../store/playlists';
import './AddPLSong.css';

const AddPLSongButton = ({ songId }) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const user = useSelector(state => state.session.user);
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
            console.log('helllloooo', e.target.value, showOptions);
            dispatch(addPlaylistSongThunk(e.target.value, songId));
        }
    }

    return (
        <div id='open-playlist-select-button'>
            <i
                id='plus-playlist-song'
                class="fa-solid fa-circle-plus"
                onClick={onPlusClick}
            ></i>
            <div className='custom-select playlist-options-container' style={{display : showOptions }}>
                <select
                    className="user-playlists-select"
                    style={{visibility : showOptions }}
                    onChange={onPlaylistSelect}
                >
                    <option
                        className="playlist-options"
                        id="create-playlist-option"
                        value="Create Playlist"
                    >Create Playlist
                    </option>
                    {playlists.length ? playlists.map(playlist => (
                        <option
                            key={playlist.id}
                            className='playlist-options'
                            value={playlist.id}
                        >{playlist.title}</option>
                    )) : null}
                </select>
            </div>
        </div>
    )
};

export default AddPLSongButton;
