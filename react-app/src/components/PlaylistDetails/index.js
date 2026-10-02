import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getPlaylistByIdThunk, removePlaylistSongThunk, loadPlaylistSongsAction } from '../../store/playlists';
import { setCurrentPlaylist, setCurrentSongIndex } from '../../store/player';
import LikeButton from '../LikeButton';
import PageStatus, { useLoadStatus } from '../PageStatus';
import SongPlayButton from '../SongPlayButton';
import './PlaylistDetails.css';

const PlaylistDetails = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();

    const user = useSelector(state => state.session.user);
    const playlist = useSelector((state) => state.playlists.singlePlaylist);
    const songsObject = useSelector((state) => state.playlists.playlistSongs);
    const songs = Object.values(songsObject);

    const [artistsText, setArtistsText] = useState('');
    const [playlistDuration, setPlaylistDuration] = useState(0);

    //for audio player use only
    const [playerSongsObject, setPlayerSongsObject] = useState({});

    const status = useLoadStatus(useCallback(
        () => dispatch(getPlaylistByIdThunk(playlistId)), [dispatch, playlistId]));

    useEffect(() => {
        if (playlist?.id) {
            let time = 0;
            setPlaylistDuration(0);
            const normalizedPlayerSongs = {};
            const songsArray = [];
            playlist.playlist_songs.forEach(playlistSong => {
                time += playlistSong.song.duration;

                // give each song unique id, so forEach Normalizer in reducer can hold duplicates
                playlistSong.song.playlistSongId = playlistSong.id;
                // in return create usual songs object with keys of songId's, for the player to key into
                normalizedPlayerSongs[playlistSong.song_id] = playlistSong.song;

                // array of songs(duplicates, included) for the Playlist Store
                songsArray.push(playlistSong.song);
            });

            setPlaylistDuration(time);
            setPlayerSongsObject(normalizedPlayerSongs);

            // Load Playlist songs to display the correct number of each song from Playlists Store
            dispatch(loadPlaylistSongsAction(songsArray));
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
    };

    const handlePlaySong = (songId) => {
        const selectedSong = playerSongsObject[songId];
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
    };

    // By the row's own playlist_song id: looking the entry up by song id
    // removed the first copy of a song that is on the playlist twice, not
    // the one clicked
    const removeSongClick = (e, playlistSongId) => {
        e.stopPropagation();
        dispatch(removePlaylistSongThunk(playlistId, playlistSongId));
    }
    // singlePlaylist is whichever playlist loaded last, which is the previous
    // page's until this one arrives, and stays so if this one never does
    if (status === 'missing' || playlist?.id !== Number(playlistId)) {
        return <PageStatus status={status} thing="playlist" />
    }

    return (
        <div className='playlist-details-container'>
            <div className='playlist-header-container'>
                <img className='playlist-details-art' src={playlist?.art ? playlist.art : 'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'} alt={`${playlist.title} playlist cover`}></img>
                <div className='playlist-info-container'>
                    <p>Playlist</p>
                    <h1 className='playlist-name-header'>{playlist.title}</h1>
                    <div className='playlist-info-wrapper'>
                        <p id="playlist-description">{playlist?.description}</p>
                        <p id="playlist-artists">{songs.length ? `Featuring artists including ${artistsText}` : 'No tracks yet.'}</p>
                        <p id="playlist-duration">{playlist?.user?.username} · {songs.length} {songs.length === 1 ? `song` : `songs`}, {secsToHrs(playlistDuration)}</p>
                    </div>
                </div>
            </div>
            <div className='playlist-buttons-container'>
                <button className='album-play-button' onClick={handlePlayPlaylist} aria-label={`Play ${playlist.title}`}>
                    <i className="fa-sharp fa-solid fa-circle-play" aria-hidden="true"></i>
                </button>
            </div>
            <ul className='playlist-songs-container'>
                <li className='playlist-songs-header'>
                    <p className='song-list-heading'> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i className="fa-regular fa-clock" id="playlist-clock-icon" aria-hidden="true"></i><span className="visually-hidden">Duration</span>
                </li>
                {songs.map((song, i) => (
                    <li key={song.playlistSongId} className='albums-songs-button' onClick={() => handlePlaySong(song.id)}>
                        <div className='number-name-container'>
                            <SongPlayButton song={song} number={i + 1} onPlay={() => handlePlaySong(song.id)} />
                            <p className='song-row-name'> &nbsp; &nbsp; {song.name}</p>
                        </div>
                        <div className='heart-time-container'>
                            <div className='heart-container'>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            <div className='playlist-songs-buttons'>
                                {user && user?.id === playlist?.user_id && (
                                    <button
                                        type='button'
                                        className='icon-button'
                                        aria-label={`Remove ${song.name} from this playlist`}
                                        onClick={(e) => removeSongClick(e, song.playlistSongId)}
                                    >
                                        <i className="fa-solid fa-circle-minus" aria-hidden="true"></i>
                                    </button>
                                )}
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
