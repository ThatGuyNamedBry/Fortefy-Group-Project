import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { getAllSongsAction } from '../../store/songs';
import AddMusicButton from '../AddMusicButton';
import LikeButton from '../LikeButton';
import AddMusicModal from '../AddMusicModal'
import './AlbumDetails.css';
import AudioPlayerComponent from '../AudioPlayer';
import { PlaybackContext } from '../../context/PlaybackContext';

const AlbumDetails = () => {

    const dispatch = useDispatch();
    const { albumId } = useParams();
    const singleAlbum = useSelector(state => state.albums.singleAlbum[albumId]);
    const user = useSelector(state => state.session.user)
    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);
    const { currentPlaylist,
        setCurrentPlaylist,
        currentSongIndex,
        setCurrentSongIndex,
        isPlaying,
        setIsPlaying } = useContext(PlaybackContext);
    // const [currentPlaylist, setCurrentPlaylist] = useState([]);

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }

    const hidePlayButton = () => {
        setHoveredSong(-1)
    }

    useEffect(() => {
        dispatch(getAlbumByIdThunk(albumId));
    }, [dispatch, albumId]);

    const albumSongs = singleAlbum ? singleAlbum.songs.sort((song1, song2) => song1.track_number - song2.track_number) : [];

    useEffect(() => {
        dispatch(getAllSongsAction(albumSongs));
        setUserOwned(singleAlbum?.user?.id === user?.id);
        console.log(singleAlbum);
    }, [dispatch, singleAlbum, albumSongs, user]);

    const editHandleClick = (e) => {

    }

    const deleteHandleClick = (e) => {

    }

    const handlePlayAlbum = () => {
        const albumSongIds = albumSongs.map((song) => song.id);
        setCurrentPlaylist(albumSongIds);
    };

    const handlePlaySong = (songId) => {
        setCurrentPlaylist([songId]);
    };


    if (!singleAlbum) {
        return null;
    }

    const albumTime = singleAlbum.songs.reduce((acc, song) => acc + song.duration, 0);

    return (
        <div className='album-details-container'>
            <div className='album-header-container'>
                <img className='album-details-art' src={singleAlbum.art} alt='No Album Art Available'></img>
                <div className='album-info-container'>
                    <p>Album</p>
                    <h3 className='album-name-header'>{singleAlbum.name}</h3>
                    <p>{singleAlbum.artist} · {singleAlbum.year} · {singleAlbum.songs.length} songs, {secsToHrs(albumTime)}</p>
                </div>
            </div>
            <div className='album-buttons-container'>
            <button className='album-play-button' onClick={handlePlayAlbum}>
                    <i class="fa-sharp fa-solid fa-circle-play"></i>
                </button>
                <div className="add-music-button-container">

                    {user && singleAlbum.user.id === user.id ? <AddMusicButton
                        modalComponent={<AddMusicModal className="add-music-modal" album={singleAlbum} />}
                    /> : null}
                </div>

            </div>
            <ul className='album-songs-container'>
                <li className='album-songs-header'>
                    <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i class="fa-regular fa-clock"></i>
                </li>
                {albumSongs.map((song, i) => (
                    <button key={song.id} className='albums-songs-button'
                        onMouseEnter={(e) => showPlayButton(i)}
                        onMouseLeave={() => hidePlayButton()}
                        onClick={() => handlePlaySong(song.id)}
                    >
                        <div className='number-name-container'>
                            <div className='song-track-number'>
                                <div style={hoveredSong !== i ? { display: "block" } : { display: "none" }}>{song.track_number}</div>
                                <div style={hoveredSong === i ? { display: "block" } : { display: "none" }}>
                                    <i className="fa-sharp fa-solid fa-play" style={{ color: "white" }}></i>
                                </div>
                            </div>
                            <p style={{ color: "white" }}> &nbsp; &nbsp; {song.name}</p>
                        </div>
                        <div className='heart-time-container'>
                            <div className='heart-container' style={hoveredSong === i ? { display: "block" } : { color: "rgb(34, 34, 34)" }}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            {userOwned ?
                                <div style={hoveredSong === i ? { display: "block" } : { color: "rgb(34, 34, 34)" }}>
                                    <i onClick={editHandleClick} className="fa-solid fa-pen-to-square"></i>
                                    &nbsp; &nbsp;
                                    <i onClick={deleteHandleClick} className="fa-regular fa-trash-can"></i>
                                </div>
                                : null}
                            <p className='album-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)}</p>
                        </div>
                    </button>
                ))}
            </ul>

        </div>
    );
};

export default AlbumDetails;
