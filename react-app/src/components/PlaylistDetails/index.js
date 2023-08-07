import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getPlaylistByIdThunk, removePlaylistSongThunk, loadPlaylistSongsAction } from '../../store/playlists';
import { loadSongsAction } from '../../store/songs';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import LikeButton from '../LikeButton';
import './PlaylistDetails.css';

const PlaylistDetails = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();

    // const currentPlaylist = useSelector((state) => state.player.currentPlaylist);
    const user = useSelector(state => state.session.user);
    const playlist = useSelector((state) => state.playlists.singlePlaylist[playlistId]);
    const songsObject = useSelector((state) => state.playlists.playlistSongs);
    const songs = Object.values(songsObject);

    const [artistsText, setArtistsText] = useState('');
    const [playlistDuration, setPlaylistDuration] = useState(0);
    const [hoveredSong, setHoveredSong] = useState(-1);

    //for audio player use only
    const [playerSongsObject, setPlayerSongsObject] = useState({});

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }

    const hidePlayButton = () => {
        setHoveredSong(-1);
    }

    useEffect(() => {
        dispatch(getPlaylistByIdThunk(playlistId));
    }, [dispatch, playlistId]);

    useEffect(() => {
        if (playlist?.id) {
            let time = 0;
            setPlaylistDuration(0);
            const normalizedPlayerSongs = {};
            const allSongsStoreArray = [];
            const songsArray = [];
            playlist.playlist_songs.forEach(playlistSong => {
                time += playlistSong.song.duration;

                // give each song unique id, so forEach Normalizer in reducer can hold duplicates
                playlistSong.song.playlistSongId = playlistSong.id;
                // in return create usual songs object with keys of songId's, for the player to key into
                normalizedPlayerSongs[playlistSong.song_id] = playlistSong.song;

                // array of songs(duplicates, included) for the Playlist Store
                songsArray.push(playlistSong.song);
                // array of Unique songs for the Songs Store
                allSongsStoreArray.push(playlistSong.song);
            });

            setPlaylistDuration(time);
            setPlayerSongsObject(normalizedPlayerSongs);

            // Load Playlist songs to display the correct number of each song from Playlists Store
            dispatch(loadPlaylistSongsAction(songsArray));
            // loadSongsAction to populate All Songs in Songs store for like functionality purposes after refresh
            dispatch(loadSongsAction(allSongsStoreArray));
        }
    }, [dispatch, playlist]);

    useEffect(() => {
        const filtererdArtists = []
        songs.forEach(song => { if (!filtererdArtists.includes(song.artist)) filtererdArtists.push(song.artist) })
        setArtistsText(filtererdArtists.join(", ")) // eslint-disable-next-line
    }, [dispatch, songsObject]);

    const handlePlayPlaylist = () => {
        const songIds = songs.map((song) => song.id);
        const playlistSongs = songIds.map((songId) => playerSongsObject[songId]);
        dispatch(setCurrentPlaylist(playlistSongs));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const handlePlaySong = (songId) => {
        const selectedSong = playerSongsObject[songId];
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const removeSongClick = (e, songId) => {
        e.stopPropagation();
        const removeSong = playlist.playlist_songs.find(song => song.song_id === songId);
        dispatch(removePlaylistSongThunk(playlistId, removeSong.id));
    }
    if(!playlist?.id) {
        return <h1>This playlist does not exist.</h1>
    }

    return (
        <div className='playlist-details-container'>
            <div className='playlist-header-container'>
                <img className='playlist-details-art' src={playlist?.art ? playlist.art : 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'} alt='Playlist Cover'></img>
                <div className='playlist-info-container'>
                    <p>Playlist</p>
                    <h3 className='playlist-name-header'>{playlist.title}</h3>
                    <div className='playlist-info-wrapper'>
                        <p id="playlist-description">{playlist?.description}</p>
                        <p id="playlist-artists">{songs.length ? `Featuring artists including ${artistsText}` : 'No tracks yet.'}</p>
                        <p id="playlist-duration">{playlist?.user?.username} · {songs.length} {songs.length === 1 ? `song` : `songs`}, {secsToHrs(playlistDuration)}</p>
                    </div>
                </div>
            </div>
            <div className='playlist-buttons-container'>
                <button className='album-play-button' onClick={handlePlayPlaylist}>
                    <i className="fa-sharp fa-solid fa-circle-play"></i>
                </button>
            </div>
            <ul className='details-songs-container'>
                <li className='details-songs-header'>
                    <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i className="fa-regular fa-clock"></i>
                </li>
                {songs.map((song, i) => (
                    <li key={song.playlistSongId} className='details-song-rows'
                        onMouseEnter={(e) => showPlayButton(i)}
                        onMouseLeave={() => hidePlayButton()}
                        onClick={() => handlePlaySong(song.id)}
                    >
                        <div className='number-name-container'>
                            <div className='track-number-cells'>
                                <div style={hoveredSong !== i ? { display: "block" } : { display: "none" }}>{i + 1}</div>
                                <div style={hoveredSong === i ? { display: "block" } : { display: "none" }}>
                                    <i className="fa-sharp fa-solid fa-play" style={{ color: "white" }}></i>
                                </div>
                            </div>
                            <p style={{ color: "white" }}> &nbsp; &nbsp; {song.name}</p>
                        </div>
                        <div className='change-to-how-album-details-index-has-it'>
                            <div className='heart-container' style={hoveredSong === i ? { display: "block" } : { color: "rgb(19, 19, 19)" }}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            <div className='playlist-songs-buttons'>
                                {user && user?.id === playlist?.user_id && <i className="fa-solid fa-circle-minus" onClick={(e) => removeSongClick(e, song?.id)}></i>}
                            </div>
                            <p className='playlist-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default PlaylistDetails;
