import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { selectAlbumSongs } from '../../store/songs';
import OpenModalButton from '../OpenModalButton';
import LikeButton from '../LikeButton';
import AddMusicModal from '../AddMusicModal'
import DeleteModal from '../DeleteModal';
import './AlbumDetails.css';
import { setCurrentPlaylist, setCurrentSongIndex } from '../../store/player';
import AddPLSongButton from '../AddPLSongButton';
import PageStatus, { useLoadStatus } from '../PageStatus';

const AlbumDetails = () => {

    const dispatch = useDispatch();
    const history = useHistory();
    const { albumId } = useParams();

    const singleAlbum = useSelector(state => state.albums.allAlbums[albumId]);
    const user = useSelector(state => state.session.user)
    // This album's songs, from the songs cache so their likes are current.
    // They used to be whatever the songs store last held: arriving from the
    // home page listed every song in the library until this album loaded.
    const songsArray = useSelector(state => selectAlbumSongs(state, albumId), shallowEqual);
    const albumTime = songsArray.reduce((acc, song) => acc + song.duration, 0);

    const [hoveredSong, setHoveredSong] = useState(-1);
    const [userOwned, setUserOwned] = useState(false);

    const status = useLoadStatus(useCallback(
        () => dispatch(getAlbumByIdThunk(albumId)), [dispatch, albumId]));

    useEffect(() => {
        setUserOwned(singleAlbum?.user?.id === user?.id);
    }, [dispatch, singleAlbum, user]);

    const handlePlayAlbum = () => {
        dispatch(setCurrentPlaylist(songsArray));
        dispatch(setCurrentSongIndex(0));
    };
    const handlePlaySong = (songId) => {
        const selectedSong = songsArray.find(song => song.id === songId);
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
    };

    const showPlayButton = (i) => {
        setHoveredSong(i);
    }
    const hidePlayButton = () => {
        setHoveredSong(-1);
    }

    // An album seen before shows from the store while it reloads, unless the
    // reload says it has since been deleted
    if (status === 'missing' || !singleAlbum) return <PageStatus status={status} thing="album" />

    return (
        <div className='album-details-container page-wrapper'>
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

                    {user && singleAlbum.user.id === user.id ? (
                        <OpenModalButton
                            className="icon-button"
                            aria-label="Add a song"
                            modalComponent={<AddMusicModal album={singleAlbum} type="create" />}
                        >
                            <i style={{ fontSize: "35px" }} className="fa-solid fa-plus" aria-hidden="true"></i>
                        </OpenModalButton>
                    ) : null}
                </div>

                <div className='edit-music-button-container'>
                    {userOwned && <div onClick={() => history.push(`/albums/${albumId}/edit`)} className='album-update-button fa-solid fa-pen-to-square'></div>}
                </div>

            </div>
            <ul className='album-songs-container'>
                <li className='album-songs-header'>
                    <p style={{ color: "rgb(160, 160, 160)" }}> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i className="fa-regular fa-clock" id="album-clock-icon"></i>
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
                            <div className='heart-container' style={hoveredSong === i ? { display: "block" } : { backgroundColor: "transparent" }}>
                                <LikeButton
                                    songId={song.id}
                                />
                            </div>
                            {userOwned && hoveredSong === i && (
                                // Inside the row, which plays the song when clicked
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                                    <OpenModalButton
                                        className="icon-button update-delete-music-buttons"
                                        aria-label="Edit song"
                                        modalComponent={<AddMusicModal song={song} album={singleAlbum} type="update" />}
                                    >
                                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                                    </OpenModalButton>
                                    <OpenModalButton
                                        className="icon-button update-delete-music-buttons"
                                        aria-label="Delete song"
                                        modalComponent={<DeleteModal type='song' id={song.id} />}
                                    >
                                        <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                                    </OpenModalButton>
                                </div>
                            )}
                            <p className='album-song-time'> &nbsp; &nbsp; {secsToMins(song.duration)} &nbsp; &nbsp; &nbsp; &nbsp; </p>
                            {user?.id && <div className='add-plsong-button-container'>
                                <AddPLSongButton
                                    songId={song.id}
                                    userId={user.id}
                                />
                            </div>}
                        </div>
                    </button>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetails;
