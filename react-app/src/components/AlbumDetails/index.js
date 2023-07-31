import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAlbumByIdThunk } from '../../store/albums';
import { secsToHrs, secsToMins } from '../../helpers';
import './AlbumDetails.css';

const AlbumDetails = () => {
    const dispatch = useDispatch();
    const { albumId } = useParams();
    const singleAlbum = useSelector(state => state.albums.singleAlbum[albumId]);

    useEffect(() => {
        dispatch(getAlbumByIdThunk(albumId));
    }, [dispatch, albumId]);

    if (!singleAlbum) {
        return null;
    }

    const albumTime = singleAlbum.songs.reduce((acc, song) => acc + song.duration, 0);

    return (
        <div className='album-details-container'>
            <div className='album-header-container'>
                <img src={singleAlbum.art} alt='No Album Art Available'></img>
                <div className='album-info-container'>
                    <p>Album</p>
                    <h3>{singleAlbum.name}</h3>
                    <p>{singleAlbum.artist} · {singleAlbum.year} · {singleAlbum.songs.length} songs, {secsToHrs(albumTime)}</p>
                </div>
            </div>
            <div className='album-buttons-container'>
                <button className='play-button'>
                    <img src='' alt='play-button'></img>
                </button>
            </div>
            <ul className='album-songs-container'>
                <li className='album-songs-header'>
                    <p>#</p>
                    <p>Title</p>
                    <img src='' alt='clock'></img>
                </li>
                {singleAlbum.songs.map(song => (
                    <li key={song.id} className='albums-songs-li'>
                        <p></p>
                        <p>{song.name}</p>
                        <button>
                            <img src='' alt='like-btn'></img>
                        </button>
                        <p>{secsToMins(song.duration)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetails;
