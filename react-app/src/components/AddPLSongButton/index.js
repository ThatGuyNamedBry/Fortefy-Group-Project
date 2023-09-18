import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAllPlaylistsThunk, addPlaylistSongThunk } from '../../store/playlists';
import './AddPLSong.css';

const AddPLSongButton = ({ songId, userId }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const ulRef = useRef();

    const playlistsObject = useSelector(state => state.playlists.allPlaylists);
    const playlists = Object.values(playlistsObject);

    const [showOptions, setShowOptions] = useState('none');

    useEffect(() => {
        dispatch(getCurrentUserAllPlaylistsThunk());
    }, [dispatch]);

    // useEffect(() => {
    //     if (showOptions === 'none') return;

    //     const closeOptions = (e) => {
    //         if (!ulRef.current.contains(e.target)) {
    //             setShowOptions('none');
    //         }
    //     };

    //     document.addEventListener("click", closeOptions);

    //     return () => document.removeEventListener("click", closeOptions);
    // }, [showOptions]);

    const onPlusClick = (e) => {
        e.stopPropagation();
        setShowOptions(showOptions === 'none' ? 'block' : 'none');
    };

    const onPlaylistSelect = (e, playlistId) => {
        e.stopPropagation();
        setShowOptions('none');

        if (playlistId === 'new') {
            history.push('/playlists/new');
        } else {
            dispatch(addPlaylistSongThunk(playlistId, songId));
        }

        // if (e.target.value === "Create Playlist") {
        //     history.push('/playlists/new');
        // } else {
        //     dispatch(addPlaylistSongThunk(e.target.value, songId));
        // }
    }

    if (!userId) {
        return null;
    }

    return (
        <div id='open-playlist-select-button'>
            <i
                id='plus-playlist-song'
                className="plsong-fixed fa-solid fa-circle-plus"
                onClick={onPlusClick}
            ></i>

            <ul className='add-plsong-options' ref={ulRef} style={{display : showOptions}}>
                <li
                    className="playlist-options"
                    id="create-playlist-option"
                    onClick={(e) => onPlaylistSelect(e, 'new')}
                    >Create Playlist
                </li>
                {playlists.map(playlist => (
                    <li
                        key={playlist.id}
                        className='playlist-options'
                        onClick={(e) => onPlaylistSelect(e, playlist.id)}
                    >{playlist.title}</li>
                ))}
            </ul>

            {/* <div className='custom-select playlist-options-container' style={{display : showOptions }}>
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
                </select> */}
            {/* </div> */}
        </div>
    )
};

export default AddPLSongButton;
