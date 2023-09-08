import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { loadSongsAction } from '../../store/songs';
import AddMusicButton from '../AddMusicButton';
import LikeButton from '../LikeButton';
import AddMusicModal from '../AddMusicModal'
import DeleteModal from '../DeleteModal';
import './AlbumDetails.css';
import { setCurrentPlaylist, setCurrentSongIndex, setIsPlaying } from '../../store/player';
import DeleteMusicButton from '../DeleteMusicButton/DeleteMusicButton';
import EditSongButton from '../EditSongButton';
import AddPLSongButton from '../AddPLSongButton';

const AlbumDetails = () => {

    const dispatch = useDispatch();
    const { albumId } = useParams();

    const singleAlbum = useSelector(state => state.albums.singleAlbum[albumId]);
    const user = useSelector(state => state.session.user);
    const songs = useSelector(state => state.songs.allSongs);

    const songsArray = Object.values(songs).sort((song1, song2) => song1.track_number - song2.track_number);
    const albumTime = songsArray.reduce((acc, song) => acc + song.duration, 0);

    // const currentPlaylist = useSelector((state) => state.player.currentPlaylist);
    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);

    useEffect(() => {
        dispatch(getAlbumByIdThunk(albumId));
    }, [dispatch, albumId]);

    useEffect(() => {
        dispatch(loadSongsAction(singleAlbum ? singleAlbum.songs : []));
    }, [dispatch, singleAlbum]);

    useEffect(() => {
        setUserOwned(singleAlbum?.user?.id === user?.id);
    }, [dispatch, singleAlbum, user]);

    const deleteHandleClick = async () => {
        await dispatch(getAlbumByIdThunk(singleAlbum?.id));
    };

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

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }
    const hidePlayButton = () => {
        setHoveredSong(-1);
    }

    if (!singleAlbum) return <h1>This album does not exist.</h1>

    return (
        <div className='album-details-container'>
            <div className='album-header-container'>
                <img className='album-details-art' src={singleAlbum.art} alt='Album Cover'></img>
                <div className='album-info-container'>
                    <p>Album</p>
                    <h3 className='album-name-header'>{singleAlbum.name}</h3>
                    <p id="album-info">{singleAlbum.artist} · {singleAlbum.year} · {singleAlbum.genre}</p>
                    <p id="album-length">{songsArray.length} {songsArray.length === 1 ? `song` : `songs`}, {secsToHrs(albumTime)}</p>
                </div>
            </div>
            <div className='album-buttons-container'>
                <button className='album-play-button' onClick={handlePlayAlbum}>
                    <i className="fa-sharp fa-solid fa-circle-play"></i>
                </button>
                <div className="add-music-button-container">
                    {user && singleAlbum.user.id === user.id ? <AddMusicButton
                        modalComponent={<AddMusicModal className="add-music-modal" album={singleAlbum} type="create" />}
                    /> : null}
                </div>
            </div>
            <table className='details-songs-container'>
                    <tr className='details-songs-header details-song-rows'>
                        <th className='track-number-cells'>#</th>
                        <th className='song-name-cells'>Title</th>
                        <th></th>
                        <th className='song-time-cells'>
                            <i className="fa-regular fa-clock"></i>
                        </th>
                        <th></th>
                        <th></th>
                    </tr>
                    {/* START Example 1 */}
                    {songsArray.map((song, i) => (
                        <tr key={song.id} className='details-song-rows'
                            onMouseEnter={(e) => showPlayButton(i)}
                            onMouseLeave={() => hidePlayButton()}
                            onClick={() => handlePlaySong(song.id)}
                        >
                            <td className='track-number-cells'>
                                <span style={hoveredSong !== i ? { display: "inline-block" } : { display: "none" }}>{song.track_number}</span>
                                <span style={hoveredSong === i ? { display: "inline-block" } : { display: "none" }}>
                                    <i className="fa-sharp fa-solid fa-play" style={{ color: "white" }}></i>
                                </span>
                            </td>
                            <td className='song-name-cells'>{song.name}</td>
                            <td className='song-heart-cells' style={hoveredSong === i ? { display: "block" } : { backgroundColor: "transparent" }}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </td>
                            <td className='song-time-cells'>{secsToMins(song.duration)}</td>
                            <td className='manage-song-buttons-cells'>
                                {userOwned && hoveredSong === i && (
                                    <span className='manage-song-buttons-modals'>
                                        <EditSongButton
                                            modalComponent={<AddMusicModal className="add-music-modal" song={song} album={singleAlbum} type="update" />}
                                        />
                                        <DeleteMusicButton
                                            modalComponent={<DeleteModal className="delete-song-modal" type='song' id={song.id} />}
                                            onClick={deleteHandleClick}
                                        />
                                    </span>
                                )}
                            </td>
                            <td className='edit-plsong-button-cells'>
                                {user?.id && (
                                    <AddPLSongButton
                                        songId={song.id}
                                        userId={user.id}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                {/* </tbody> */}
            </table>
        </div>
    );
};

export default AlbumDetails;
