import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addPlaylistSongThunk, selectUserPlaylists } from '../../store/playlists';
import './AddPLSong.css';

const AddPLSongButton = ({ songId, userId }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const menuRef = useRef();

    // Loaded once per login by App. This button is rendered on every song
    // row, so fetching here sent one identical request per row.
    const playlists = useSelector(selectUserPlaylists, shallowEqual);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Capture phase: the toggle and the options stop their clicks from
        // bubbling, so the row underneath does not play the song, and a
        // bubbling listener would never hear a click on another row's toggle
        const closeOnOutsideClick = (e) => {
            // No menu at all once the user has logged out
            if (!menuRef.current?.contains(e.target)) setIsOpen(false);
        };
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('click', closeOnOutsideClick, true);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('click', closeOnOutsideClick, true);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    const onPlusClick = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const onPlaylistSelect = (e, playlistId) => {
        e.stopPropagation();
        setIsOpen(false);

        if (playlistId === 'new') {
            history.push('/playlists/new');
        } else {
            dispatch(addPlaylistSongThunk(playlistId, songId));
        }
    }

    if (!userId) {
        return null;
    }

    return (
        <div className='add-plsong' ref={menuRef}>
            <i
                className={`add-plsong-toggle fa-solid fa-circle-plus${isOpen ? ' is-open' : ''}`}
                title='Add to playlist'
                onClick={onPlusClick}
            ></i>

            <ul className='add-plsong-options' style={{ display: isOpen ? 'block' : 'none' }}>
                <li
                    className='playlist-options add-plsong-create'
                    onClick={(e) => onPlaylistSelect(e, 'new')}
                    >Create Playlist
                </li>
                {playlists.map(playlist => (
                    <li
                        key={playlist.id}
                        className='playlist-options'
                        title={playlist.title}
                        onClick={(e) => onPlaylistSelect(e, playlist.id)}
                    >{playlist.title}</li>
                ))}
            </ul>
        </div>
    )
};

export default AddPLSongButton;
