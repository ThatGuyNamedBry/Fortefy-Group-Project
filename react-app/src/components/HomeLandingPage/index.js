import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAlbumsThunk } from '../../store/albums';
import { getAllSongsThunk } from '../../store/songs';
import { getAllPlaylistsThunk } from '../../store/playlists';
import './HomeLandingPage.css';
import { Link, NavLink } from 'react-router-dom';
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";

const HomeLandingPage = () => {
    const dispatch = useDispatch();
    const allAlbums = useSelector(state => state.albums.allAlbums);
    const allSongs = useSelector(state => state.songs.allSongs);
    const allPlaylists = useSelector((state) => state.playlists.allPlaylists);
    const user = useSelector(state => state.session.user)
    const [sortedSongs, setSortedSongs] = useState([]);
    const [startIndexAlbums, setStartIndexAlbums] = useState(0);
    const [startIndexSongs, setStartIndexSongs] = useState(0);
    const [startIndexPlaylists, setStartIndexPlaylists] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    const itemsPerPage = 4;

    useEffect(() => {
        dispatch(getAllAlbumsThunk());
        dispatch(getAllSongsThunk());
        dispatch(getAllPlaylistsThunk());
    }, [dispatch]);

    useEffect(() => {
        setSortedSongs(Object.values(allSongs).sort(() => Math.random() - 0.5));
    }, [allSongs]);

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
            setShowMenu(false);
            }
        };

        document.addEventListener("click", closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const closeMenu = () => setShowMenu(false);


    const handleNextClickAlbums = () => {
        if (startIndexAlbums + itemsPerPage < Object.values(allAlbums).length) {
            setStartIndexAlbums(startIndexAlbums + itemsPerPage);
        }
    };

    const handlePrevClickAlbums = () => {
        if (startIndexAlbums - itemsPerPage >= 0) {
            setStartIndexAlbums(startIndexAlbums - itemsPerPage);
        }
    };

    const handleNextClickSongs = () => {
        if (startIndexSongs + itemsPerPage < Object.values(allSongs).length) {
            setStartIndexSongs(startIndexSongs + itemsPerPage);
        }
    };

    const handlePrevClickSongs = () => {
        if (startIndexSongs - itemsPerPage >= 0) {
            setStartIndexSongs(startIndexSongs - itemsPerPage);
        }
    };

    const handlePrevClickPlaylists = () => {
        if (startIndexPlaylists - itemsPerPage >= 0) {
            setStartIndexPlaylists(startIndexPlaylists - itemsPerPage);
        }
    };

    const handleNextClickPlaylists = () => {
        if (startIndexPlaylists + itemsPerPage < Object.values(allPlaylists).length) {
            setStartIndexPlaylists(startIndexPlaylists + itemsPerPage);
        }
    };

    return (
        <div className="home-container">
            <div className="your-library-container">
                {user?.id ? (
                    <NavLink to="/profile">
                        <h2>Your Library</h2>
                    </NavLink>
                ) : (<h2>Your Library</h2>)}
                <div>
                    {user ? (
                        <div className='library-container'>
                            {Object.values(allPlaylists)
                                .filter(playlist => playlist.user_id === user.id)
                                .map(playlist => (
                                    <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="playlist-tile">
                                        <img src={playlist.art} alt={playlist.title} className="playlist-image" />
                                        <h3>{playlist.title}</h3>
                                    </Link>
                                ))}
                            {Object.values(allPlaylists).every(playlist => playlist.user_id !== user.id) && (
                                <Link to="/playlists/new" className="create-playlist-link">
                                    Create Your First Playlist!
                                </Link>
                            )}
                        </div>
                    ) : (
                        // <div>
                        //     <h2>Please log in to see your playlists</h2>
                        // </div>
                        <div className='loginbuttonlibrary'>
                            {<OpenModalButton
                                buttonText="Log in to see your playlists!"
                                onItemClick={closeMenu}
                                modalComponent={<LoginFormModal />}
                            />}
                        </div>
                    )}
                </div>
            </div>
            <div className="discover-music-container">
                <div className="album-grid-header">
                    <h2>All Albums</h2>
                    <div className="item-scroll">
                        <div
                            className={`fa-solid fa-angles-left ${startIndexAlbums === 0 ? 'disabled' : ''}`}
                            onClick={handlePrevClickAlbums}
                        ></div>
                        <div
                            className={`fa-solid fa-angles-right ${startIndexAlbums + itemsPerPage >= Object.values(allAlbums).length ? 'disabled' : ''
                                }`}
                            onClick={handleNextClickAlbums}
                        ></div>
                    </div>
                </div>
                <div id='all-albums-container' className="album-grid">
                    {Object.values(allAlbums)
                        .slice(startIndexAlbums, startIndexAlbums + itemsPerPage)
                        .map(album => (
                            <Link key={album.id} to={`/albums/${album.id}`} className="album-tile link-as-text">
                                <img src={album.art} alt={album.name} className="album-image" />
                                <h3>{album.name}</h3>
                                <p className='owner-text'>{album.artist}</p>
                            </Link>
                        ))}
                </div>
                <div className="album-grid-header">
                    <h2>Discover Songs</h2>
                    <div className="item-scroll">
                        <div
                            className={`fa-solid fa-angles-left ${startIndexSongs === 0 ? 'disabled' : ''}`}
                            onClick={handlePrevClickSongs}
                        ></div>
                        <div
                            className={`fa-solid fa-angles-right ${startIndexSongs + itemsPerPage >= Object.values(allSongs).length ? 'disabled' : ''
                                }`}
                            onClick={handleNextClickSongs}
                        ></div>
                    </div>
                </div>
                <div id='all-songs-container' className="album-grid">
                    {sortedSongs
                        .slice(startIndexSongs, startIndexSongs + itemsPerPage)
                        .map(song => {
                            const album = allAlbums[song.album_id];
                            return (
                                <Link key={`${album?.id}-${song?.id}`} to={`/albums/${album?.id}`} className="album-tile link-as-text">
                                    <img src={album?.art} alt={album?.name} className="album-image" />
                                    <h3>{song.name}</h3>
                                    <p className='owner-text'>{album?.artist}</p>
                                </Link>
                            );
                        })}
                </div>
                <div className="album-grid-header">
                    <h2>All Playlists</h2>
                    <div className="item-scroll">
                        <div
                            className={`fa-solid fa-angles-left ${startIndexPlaylists === 0 ? 'disabled' : ''}`}
                            onClick={handlePrevClickPlaylists}
                        ></div>
                        <div
                            className={`fa-solid fa-angles-right ${startIndexPlaylists + itemsPerPage >= Object.values(allPlaylists).length ? 'disabled' : ''
                                }`}
                            onClick={handleNextClickPlaylists}
                        ></div>
                    </div>
                </div>
                <div id='all-playlists-container' className="album-grid">
                    {Object.values(allPlaylists)
                        .slice(startIndexPlaylists, startIndexPlaylists + itemsPerPage)
                        .map(playlist => (
                            <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="album-tile link-as-text">
                                <img src={playlist.art} alt={playlist.title} className="album-image" />
                                <h3>{playlist.title}</h3>
                                <p className='owner-text'>{playlist.user.username}</p>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default HomeLandingPage;

{/* <div className="item-scroll">
    <div className='fa-solid fa-angles-left' onClick={handlePrevClickAlbums} disabled={startIndexAlbums === 0}></div>
    <div className='fa-solid fa-angles-right' onClick={handleNextClickAlbums} disabled={startIndexAlbums + itemsPerPage >= Object.values(allAlbums).length}></div>
</div> */}

{/* <div className="item-scroll">
<div className='fa-solid fa-angles-left' onClick={handlePrevClickSongs} disabled={startIndexSongs === 0}></div>
<div className='fa-solid fa-angles-right' onClick={handleNextClickSongs} disabled={startIndexSongs + itemsPerPage >= sortedSongs.length}></div>
</div> */}

{/* <div className="item-scroll">
    <div className='fa-solid fa-angles-left' onClick={handlePrevClickPlaylists} disabled={startIndexPlaylists === 0}></div>
    <div className='fa-solid fa-angles-right' onClick={handleNextClickPlaylists} disabled={startIndexPlaylists + itemsPerPage >= Object.values(allPlaylists).length}></div>
</div> */}
