import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getLikedSongsThunk } from '../../store/songs';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import LikeButton from '../LikeButton';
import AddPLSongButton from '../AddPLSongButton';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import LikedSongsCover from './LikedSongsCover';
import './LikedSongs.css';

/**
 * The "Liked Songs" playlist: a read-only, auto-generated collection of every
 * song the logged-in user has liked, most recently liked first.
 *
 * It is not a real playlist row in the database. The songs are fetched from
 * GET /api/songs/liked into the songs store, and the list rendered here is
 * derived from that store, so unliking a song (via the heart) drops it from
 * the list immediately.
 */
const LikedSongs = () => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.session.user);
    const allSongs = useSelector(state => state.songs.allSongs);

    // Order in which the API returned the liked songs (most recent like first).
    const [likedSongIds, setLikedSongIds] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredSong, setHoveredSong] = useState(-1);

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;
        setIsLoaded(false);
        dispatch(getLikedSongsThunk()).then((songs) => {
            setLikedSongIds(songs ? songs.map(song => song.id) : []);
            setIsLoaded(true);
        });
    }, [dispatch, userId]);

    // Only keep songs the user still likes, so the list reacts to the heart button.
    const songs = likedSongIds
        .map(songId => allSongs[songId])
        .filter(song => song && song.likes.some(like => like.user_id === userId));

    const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
    const artists = [];
    songs.forEach(song => { if (!artists.includes(song.artist)) artists.push(song.artist); });

    const handlePlayAll = () => {
        if (!songs.length) return;
        dispatch(setCurrentPlaylist(songs));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const handlePlaySong = (song) => {
        dispatch(setCurrentPlaylist([song]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    if (!user) {
        return (
            <div className='liked-songs-container liked-songs-login'>
                <LikedSongsCover className='liked-songs-details-art' />
                <h2>Log in to see your Liked Songs</h2>
                <p>Every song you like is collected here, in one playlist.</p>
                <OpenModalButton
                    buttonText="Log In"
                    modalComponent={<LoginFormModal />}
                />
            </div>
        );
    }

    return (
        <div className='liked-songs-container'>
            <div className='liked-songs-header-container'>
                <LikedSongsCover className='liked-songs-details-art' />
                <div className='liked-songs-info-container'>
                    <p>Playlist</p>
                    <h3 className='liked-songs-name-header'>Liked Songs</h3>
                    <div className='liked-songs-info-wrapper'>
                        <p id="liked-songs-description">Every song you like, all in one place.</p>
                        <p id="liked-songs-artists">
                            {songs.length ? `Featuring artists including ${artists.join(', ')}` : 'No liked songs yet.'}
                        </p>
                        <p id="liked-songs-duration">
                            {user.username} · {songs.length} {songs.length === 1 ? 'song' : 'songs'}, {secsToHrs(totalDuration)}
                        </p>
                    </div>
                </div>
            </div>
            <div className='liked-songs-buttons-container'>
                <button
                    className='album-play-button'
                    onClick={handlePlayAll}
                    disabled={!songs.length}
                    aria-label="Play Liked Songs"
                >
                    <i className="fa-sharp fa-solid fa-circle-play"></i>
                </button>
            </div>
            <ul className='liked-songs-list'>
                <li className='liked-songs-list-header'>
                    <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i className="fa-regular fa-clock" id="liked-songs-clock-icon"></i>
                </li>
                {isLoaded && !songs.length && (
                    <li className='liked-songs-empty'>
                        <p>Songs you like will show up here.</p>
                        <p>Tap the <i className="fa-sharp fa-regular fa-heart"></i> on any song to save it to Liked Songs.</p>
                        <Link to="/" className='liked-songs-discover-link'>Discover Songs</Link>
                    </li>
                )}
                {songs.map((song, i) => (
                    <li key={song.id} className='albums-songs-button'
                        onMouseEnter={() => setHoveredSong(i)}
                        onMouseLeave={() => setHoveredSong(-1)}
                        onClick={() => handlePlaySong(song)}
                    >
                        <div className='number-name-container'>
                            <div className='song-track-number'>
                                <div style={hoveredSong !== i ? { display: "block" } : { display: "none" }}>{i + 1}</div>
                                <div style={hoveredSong === i ? { display: "block" } : { display: "none" }}>
                                    <i className="fa-sharp fa-solid fa-play" style={{ color: "white" }}></i>
                                </div>
                            </div>
                            <img className='liked-songs-row-art' src={song.album_art} alt="" />
                            <div className='liked-songs-row-text'>
                                <p style={{ color: "white" }}>{song.name}</p>
                                <Link
                                    to={`/albums/${song.album_id}`}
                                    className='liked-songs-row-artist'
                                    onClick={(e) => e.stopPropagation()}
                                >{song.artist}</Link>
                            </div>
                        </div>
                        <div className='heart-time-container'>
                            <div className='heart-container'>
                                <LikeButton songId={song.id} />
                            </div>
                            <p className='liked-songs-time'> &nbsp; &nbsp; {secsToMins(song.duration)} &nbsp; &nbsp; &nbsp; &nbsp; </p>
                            <div className='add-plsong-button-container'>
                                <AddPLSongButton songId={song.id} userId={user.id} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LikedSongs;
