import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { getAllSongsAction } from '../../store/songs';
import AddMusicButton from '../AddMusicButton';
import LikeButton from '../LikeButton';
import AddMusicModal from '../AddMusicModal'
import DeleteModal from '../DeleteModal';
import './AlbumDetails.css';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import DeleteMusicButton from '../DeleteMusicButton/DeleteMusicButton';
import EditSongButton from '../EditSongButton';

const AlbumDetails = () => {

    const dispatch = useDispatch();
    const { albumId } = useParams();
    const singleAlbum = useSelector(state => state.albums.singleAlbum[albumId]);
    const songs = useSelector(state => state.songs.allSongs);
    const songsArray = Object.values(songs);
    const user = useSelector(state => state.session.user)
    const currentPlaylist = useSelector((state) => state.player.currentPlaylist);
    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }

    const hidePlayButton = () => {
        setHoveredSong(-1)
    }

    useEffect(() => {
        dispatch(getAlbumByIdThunk(albumId));
    }, [dispatch, albumId]);

    useEffect(() => {
        const albumSongs = singleAlbum ? singleAlbum.songs.sort((song1, song2) => song1.track_number - song2.track_number) : [];
        dispatch(getAllSongsAction(albumSongs));
    }, [dispatch, singleAlbum])


    useEffect(() => {
        setUserOwned(singleAlbum?.user?.id === user?.id);
    }, [dispatch, singleAlbum, songs, user]);


    const editHandleClick = (e) => {
        e.stopPropagation();
    }

    const deleteHandleClick = async () => {
        await dispatch(getAlbumByIdThunk(singleAlbum?.id))
    }

    const handlePlayAlbum = () => {
        const albumSongIds = singleAlbum.songs.map((song) => song.id);
        const albumSongs = albumSongIds.map((songId) => songs[songId]);
        dispatch(setCurrentPlaylist(albumSongs));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    const handlePlaySong = (songId) => {
        const selectedSong = songs[songId];
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
        dispatch(setIsPlaying(true));
    };

    if (!singleAlbum) return <h1>This album does not exist.</h1>

    const albumTime = songsArray.reduce((acc, song) => acc + song.duration, 0);

    return (
        <div className='album-details-container'>
            <div className='album-header-container'>
                <div id="album-art-container">
                    <img className='album-details-art' src={singleAlbum.art} alt='No Album Art Available'></img>
                </div>
                <div className='album-info-container'>
                    <p>Album</p>
                    <h3 className='album-name-header'>{singleAlbum.name}</h3>
                    <p id="album-info">{singleAlbum.artist} · {singleAlbum.year} · {singleAlbum.genre}</p>
                    <p id="album-length">{songsArray.length} {songsArray.length === 1 ? `song` : `songs`}, {secsToHrs(albumTime)}</p>
                </div>
            </div>
            <div className='album-buttons-container'>
                <button className='album-play-button' onClick={handlePlayAlbum}>
                    <i class="fa-sharp fa-solid fa-circle-play"></i>
                </button>
                <div className="add-music-button-container">

                    {user && singleAlbum.user.id === user.id ? <AddMusicButton
                        modalComponent={<AddMusicModal className="add-music-modal" album={singleAlbum} type="create" />}
                    /> : null}
                </div>

            </div>
            <ul className='album-songs-container'>
                <li className='album-songs-header'>
                    <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i class="fa-regular fa-clock"></i>
                </li>
                {songsArray.map((song, i) => (
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
                            <div className='heart-container' style={hoveredSong === i ? { display: "block" } : { color: "rgb(19, 19, 19)" }}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            {userOwned && hoveredSong === i && (
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                    <EditSongButton
                                        modalComponent={<AddMusicModal className="add-music-modal" song={song} album={singleAlbum} type="update" />}
                                    />
                                    <DeleteMusicButton
                                        modalComponent={<DeleteModal className="delete-song-modal" type='song' id={song.id} />}
                                        onClick={deleteHandleClick}
                                    />
                                </div>
                            )}
                            <p className='album-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)}</p>
                        </div>
                    </button>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetails;
