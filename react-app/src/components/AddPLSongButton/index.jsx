import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addPlaylistSongThunk, selectUserPlaylists } from '../../store/playlists';
import './AddPLSong.css';

// For each menu's id; React 17 has no useId
let nextMenuId = 0;

const AddPLSongButton = ({ songId, userId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menuRef = useRef();
    const toggleRef = useRef();
    const menuIdRef = useRef(null);
    if (menuIdRef.current === null) menuIdRef.current = `add-plsong-options-${++nextMenuId}`;

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
            if (e.key !== 'Escape') return;
            // Back to the toggle if the keyboard was in the menu
            if (menuRef.current?.contains(document.activeElement)) toggleRef.current.focus();
            setIsOpen(false);
        };
        // Tabbing out of the menu closes it, like clicking outside does
        const closeOnFocusOut = (e) => {
            if (!menuRef.current?.contains(e.target)) setIsOpen(false);
        };

        document.addEventListener('click', closeOnOutsideClick, true);
        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('focusin', closeOnFocusOut);
        return () => {
            document.removeEventListener('click', closeOnOutsideClick, true);
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('focusin', closeOnFocusOut);
        };
    }, [isOpen]);

    const onPlusClick = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const onPlaylistSelect = (e, playlistId) => {
        e.stopPropagation();
        setIsOpen(false);
        toggleRef.current.focus();

        if (playlistId === 'new') {
            navigate('/playlists/new');
        } else {
            dispatch(addPlaylistSongThunk(playlistId, songId));
        }
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="add-plsong" ref={menuRef}>
            <button
                type="button"
                ref={toggleRef}
                className={`add-plsong-toggle${isOpen ? ' is-open' : ''}`}
                title="Add to playlist"
                aria-label="Add to playlist"
                aria-expanded={isOpen}
                aria-controls={menuIdRef.current}
                onClick={onPlusClick}
            >
                <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
            </button>

            <ul
                className="add-plsong-options"
                id={menuIdRef.current}
                style={{ display: isOpen ? 'block' : 'none' }}
            >
                <li>
                    <button
                        type="button"
                        className="playlist-options add-plsong-create"
                        onClick={(e) => onPlaylistSelect(e, 'new')}
                    >
                        Create Playlist
                    </button>
                </li>
                {playlists.map((playlist) => (
                    <li key={playlist.id}>
                        <button
                            type="button"
                            className="playlist-options"
                            title={playlist.title}
                            onClick={(e) => onPlaylistSelect(e, playlist.id)}
                        >
                            {playlist.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AddPLSongButton;
