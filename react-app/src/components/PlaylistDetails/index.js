import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getPlaylistByIdThunk } from '../../store/playlists';
import { getAllSongsAction } from '../../store/songs';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import LikeButton from '../LikeButton';
import './PlaylistDetails.css';

const PlaylistDetails = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();

    const currentPlaylist = useSelector((state) => state.player.currentPlaylist);

    const user = useSelector((state) => state.session.user);
    const playlist = useSelector((state) => state.playlists.singlePlaylist);
    const playlistSongsObject = useSelector((state) => state.songs.allSongs);
    const playlistSongs = Object.values(playlistSongsObject);

    const [playlistDuration, setPlaylistDuration] = useState(0);
    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);

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
            setPlaylistDuration(0);
            const songsArr = [];
            let time = 0;
            playlist.playlist_songs.forEach(playlistSong => {
                songsArr.push(playlistSong.song);
                time += playlistSong.song.duration;
            });
            setPlaylistDuration(time);
            // may have to adjust
            // if (currentPlaylist.length > 0) {
            //     return;
            // }
            //
            dispatch(getAllSongsAction(songsArr));
        }
    }, [dispatch, playlist]);

    const handlePlayPlaylist = () => {
        const playlistSongIds = playlistSongs.map((song) => song.id);
        dispatch(setCurrentPlaylist(playlistSongIds));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const handlePlaySong = (songId) => {
        dispatch(setCurrentPlaylist([songId]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const removeSongClick = (e) => {

    }

    return (
        <div className='playlist-details-container'>
            <div className='playlist-header-container'>
                <img className='playlist-details-art' src={playlist?.art ? playlist.art : 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'} alt='No Playlist Image'></img>
                <div className='playlist-info-container'>
                    <p>Playlist</p>
                    <h3 className='playlist-name-header'>{playlist.title}</h3>
                    <p>** Artists ** {playlistSongs?.length} &nbsp;songs, {secsToHrs(playlistDuration)}</p>
                </div>
            </div>
            <div className='playlist-buttons-container'>

            </div>
            <ul className='playlist-songs-container'>
                <li className='playlist-songs-header'>
                <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i class="fa-regular fa-clock"></i>
                </li>
                {playlistSongs.map((song, i) => (
                    <button key={song.id} className='albums-songs-button'
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
                            <i className="fa-solid fa-circle-minus" onClick={removeSongClick}></i>
                        </div>
                        <p className='playlist-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)}</p>
                    </div>
                </button>
                ))}
            </ul>
        </div>
    )
}

export default PlaylistDetails;
