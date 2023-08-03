import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getPlaylistByIdThunk, removePlaylistSongThunk, loadPlaylistSongsAction } from '../../store/playlists';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import LikeButton from '../LikeButton';
import './PlaylistDetails.css';

const PlaylistDetails = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();

    const currentPlaylist = useSelector((state) => state.player.currentPlaylist);

    const user = useSelector((state) => state.session.user);
    const playlist = useSelector((state) => state.playlists.singlePlaylist);
    const songsObject = useSelector((state) => state.playlists.playlistSongs);
    const songs = Object.values(songsObject);

    const [artistsText, setArtistsText] = useState('');
    const [playlistDuration, setPlaylistDuration] = useState(0);
    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);

    //for audio player use only
    const [playerSongsObject, setPlayerSongsObject] = useState({});

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }

    const hidePlayButton = () => {
        setHoveredSong(-1)
    }

    useEffect(() => {
        dispatch(getPlaylistByIdThunk(playlistId));
    }, [dispatch, playlistId]);

    useEffect(() => {
        if (playlist?.id) {
            let time = 0;
            setPlaylistDuration(0);
            const normalizedPlayerSongs = {};
            const songsArr = [];
            playlist.playlist_songs.forEach(playlistSong => {
                time += playlistSong.song.duration;

            // give each song unique id, so forEach Normalizer in reducer can hold duplicates
                playlistSong.song.playlistSongId = playlistSong.id;
            // in return create usual songs object with keys of songId's, for the player to key into
                normalizedPlayerSongs[playlistSong.song_id] = playlistSong.song;

                songsArr.push(playlistSong.song);
            });

            setPlaylistDuration(time);
            setPlayerSongsObject(normalizedPlayerSongs);
            dispatch(loadPlaylistSongsAction(songsArr));
        }
    }, [dispatch, playlist]);

    useEffect(() => {
        const artistsString = songs.reduce((acc, song) => acc + `, ${song.artist}`, '');
        setArtistsText(artistsString.slice(2));
    }, [dispatch, songsObject]);

    const handlePlayPlaylist = () => {
        const songIds = songs.map((song) => song.id);
        const playlistSongs = songIds.map((songId) => playerSongsObject[songId]);
        dispatch(setCurrentPlaylist(playlistSongs));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const handlePlaySong = (songId) => {
        const selectedSong = playerSongsObject[songId]
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const removeSongClick = (e, songId) => {
        e.stopPropagation();
        const removeSong = playlist.playlist_songs.find(song => song.song_id === songId);
        dispatch(removePlaylistSongThunk(playlistId, removeSong.id));
    }

    return (
        <div className='playlist-details-container'>
            <div className='playlist-header-container'>
                <img className='playlist-details-art' src={playlist?.art ? playlist.art : 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'} alt='Playlist Art Available'></img>
                <div className='playlist-info-container'>
                    <p>Playlist</p>
                    <h3 className='playlist-name-header'>{playlist.title}</h3>
                    <div className='playlist-info-container'>
                        <p>{playlist?.description}</p>
                        <p>Features artists including {artistsText}</p>
                        <p>{songs?.length} &nbsp;songs, {secsToHrs(playlistDuration)}</p>
                    </div>
                </div>
            </div>
            <div className='playlist-buttons-container'>
                <button className='album-play-button' onClick={handlePlayPlaylist}>
                    <i class="fa-sharp fa-solid fa-circle-play"></i>
                </button>
            </div>
            <ul className='playlist-songs-container'>
                <li className='playlist-songs-header'>
                <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i class="fa-regular fa-clock"></i>
                </li>
                {songs.map((song, i) => (
                    <li key={song.playlistId} className='albums-songs-button'
                    onMouseEnter={(e) => showPlayButton(i)}
                    onMouseLeave={() => hidePlayButton()}
                    onClick={() => handlePlaySong(song.id)}
                >
                    <div className='number-name-container'>
                        <div className='song-track-number'>
                            <div style={hoveredSong !== i ? { display: "block" } : { display: "none" }}>{i + 1}</div>
                            <div style={hoveredSong === i ? { display: "block" } : { display: "none" }}>
                                <i className="fa-sharp fa-solid fa-play" style={{ color: "white" }}></i>
                            </div>
                        </div>
                        <p style={{ color: "white" }}> &nbsp; &nbsp; {song.name}</p>
                    </div>
                    <div className='heart-time-container'>
                        <div className='heart-container' style={hoveredSong === i ? { display: "block" } : { color: "rgb(19, 19, 19)" }}>
                            <LikeButton
                                songId={song.id}
                            />
                        </div>
                        <div className='playlist-songs-buttons'>
                            <i className="fa-solid fa-circle-minus" onClick={ (e) => removeSongClick(e, song?.id)}></i>
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
