import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { getAllSongsAction } from '../../store/songs';
import LikeButton from '../LikeButton';
import './AlbumDetails.css';

const AlbumDetails = () => {
    const dispatch = useDispatch();
    const { albumId } = useParams();
    const singleAlbum = useSelector(state => state.albums.singleAlbum[albumId]);
    const [hoveredSong, setHoveredSong] = useState(-1);

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
    }, [dispatch, singleAlbum, albumSongs])

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
                <button className='album-play-button'>
                    <i class="fa-sharp fa-solid fa-circle-play"></i>
                </button>
            </div>
            <ul className='album-songs-container'>
                <li className='album-songs-header'>
                    <p style={{color: "rgb(160, 160, 160)"}}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i class="fa-regular fa-clock"></i>
                </li>
                {albumSongs.map((song, i) => (
                    <button key={song.id} className='albums-songs-button'
                        onMouseEnter={(e) => showPlayButton(i)}
                        onMouseLeave={() => hidePlayButton()}
                    >
                        <div className='number-name-container'>
                            <div className='song-track-number'>
                                <div style={hoveredSong !== i ? {display: "block"} : {display: "none"}}>{song.track_number}</div>
                                <div style={hoveredSong === i ? {display: "block"} : {display: "none"}}>
                                    <i className="fa-sharp fa-solid fa-play" style={{color: "white"}}></i>
                                </div>
                            </div>
                            <p style={{color: "white"}}> &nbsp; &nbsp; {song.name}</p>
                        </div>
                        <div className='heart-time-container'>
                            <div className='heart-container' style={hoveredSong === i ? {display: "block"} : {color: "rgb(34, 34, 34)"}}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            <p className='album-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)}</p>
                        </div>
                    </button>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetails;
