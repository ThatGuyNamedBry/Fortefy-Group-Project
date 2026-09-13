import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAlbumsThunk } from '../../store/albums';
import { getAllSongsThunk } from '../../store/songs';
import { getAllPlaylistsThunk } from '../../store/playlists';
import './HomeLandingPage.css';
import { Link } from 'react-router-dom';
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import Carousel from '../Carousel';
import LikedSongsCover from '../LikedSongs/LikedSongsCover';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';

const HomeLandingPage = () => {
    const dispatch = useDispatch();
    const allAlbums = useSelector(state => state.albums.allAlbums);
    const allSongs = useSelector(state => state.songs.allSongs);
    const allPlaylists = useSelector((state) => state.playlists.allPlaylists);
    const user = useSelector(state => state.session.user)
    const [sortedSongs, setSortedSongs] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();
    const [hoveredSong, setHoveredSong] = useState(null);

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

    const handlePlaySong = (songId, e) => {
        e.stopPropagation();
        const selectedSong = allSongs[songId];
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const showPlayButton = (songId) => {
        setHoveredSong(songId);
    };

    const hidePlayButton = () => {
        setHoveredSong(null);
    };

    return (
        <div className="home-container">
            <div className="your-library-container">
                <h2>Your Library</h2>
                <div>
                    {user ? (
                        <div className='library-container'>
                            <Link to="/playlists/liked" className="playlist-tile liked-songs-tile">
                                <LikedSongsCover className="playlist-image" />
                                <h3>Liked Songs</h3>
                            </Link>
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
                <Carousel
                    title="All Albums"
                    items={Object.values(allAlbums)}
                    renderItem={album => (
                        <Link to={`/albums/${album.id}`} className="album-tile link-as-text">
                            <img src={album.art} alt={album.name} className="album-image" />
                            <h3>{album.name}</h3>
                            <p className='owner-text'>{album.artist}</p>
                        </Link>
                    )}
                />
                <Carousel
                    title="Discover Songs"
                    items={sortedSongs}
                    renderItem={song => (
                        <div
                            className="album-tile link-as-text"
                            onMouseEnter={() => showPlayButton(song.id)}
                            onMouseLeave={hidePlayButton}
                        >
                            <Link to={`/albums/${song.album_id}`} className="song-link">
                                <img src={song.album_art} alt={song.album_name} className="album-image" />
                                <h3>{song.name}</h3>
                                <p className="owner-text">{song.artist}</p>
                            </Link>
                            {hoveredSong === song.id && (
                                <div className="play-button" onClick={(e) => handlePlaySong(song.id, e)}>
                                    <i className="fa-sharp fa-solid fa-circle-play" />
                                </div>
                            )}
                        </div>
                    )}
                />
                <Carousel
                    title="All Playlists"
                    items={Object.values(allPlaylists)}
                    renderItem={playlist => (
                        <Link to={`/playlists/${playlist.id}`} className="album-tile link-as-text">
                            <img src={playlist.art} alt={playlist.title} className="album-image" />
                            <h3>{playlist.title}</h3>
                            <p className='owner-text'>{playlist.user.username}</p>
                        </Link>
                    )}
                />
            </div>
        </div>
    );
};

export default HomeLandingPage;
