import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { secsToHrs, secsToMins } from '../../helpers';
import { getAlbumByIdThunk } from '../../store/albums';
import { selectAlbumSongs } from '../../store/songs';
import OpenModalButton from '../OpenModalButton';
import LikeButton from '../LikeButton';
import AddMusicModal from '../AddMusicModal';
import DeleteModal from '../DeleteModal';
import './AlbumDetails.css';
import { setCurrentPlaylist, setCurrentSongIndex } from '../../store/player';
import AddPLSongButton from '../AddPLSongButton';
import PageStatus, { useLoadStatus } from '../PageStatus';
import SongPlayButton from '../SongPlayButton';
import Artwork from '../Artwork';

const AlbumDetails = () => {
    const dispatch = useDispatch();
    const { albumId } = useParams();

    const singleAlbum = useSelector((state) => state.albums.allAlbums[albumId]);
    const user = useSelector((state) => state.session.user);
    // This album's songs, from the songs cache so their likes are current.
    // They used to be whatever the songs store last held: arriving from the
    // home page listed every song in the library until this album loaded.
    const songsArray = useSelector((state) => selectAlbumSongs(state, albumId), shallowEqual);
    const albumTime = songsArray.reduce((acc, song) => acc + song.duration, 0);

    const userOwned = Boolean(user) && singleAlbum?.user?.id === user.id;

    const status = useLoadStatus(
        useCallback(() => dispatch(getAlbumByIdThunk(albumId)), [dispatch, albumId]),
    );

    const handlePlayAlbum = () => {
        dispatch(setCurrentPlaylist(songsArray));
        dispatch(setCurrentSongIndex(0));
    };
    const handlePlaySong = (songId) => {
        const selectedSong = songsArray.find((song) => song.id === songId);
        dispatch(setCurrentPlaylist([selectedSong]));
        dispatch(setCurrentSongIndex(0));
    };

    // An album seen before shows from the store while it reloads, unless the
    // reload says it has since been deleted
    if (status === 'missing' || !singleAlbum) return <PageStatus status={status} thing="album" />;

    return (
        <div className="album-details-container page-wrapper">
            <div className="album-header-container">
                <Artwork
                    className="album-details-art"
                    src={singleAlbum.art}
                    alt={`${singleAlbum.name} album cover`}
                />
                <div className="album-info-container">
                    <p>Album</p>
                    <h1 className="album-name-header">{singleAlbum.name}</h1>
                    <p id="album-info">
                        {singleAlbum.artist} · {singleAlbum.year} · {singleAlbum.genre}
                    </p>
                    <p id="album-length">
                        {songsArray.length} {songsArray.length === 1 ? `song` : `songs`},{' '}
                        {secsToHrs(albumTime)}
                    </p>
                </div>
            </div>
            <div className="album-buttons-container">
                <button
                    className="album-play-button"
                    onClick={handlePlayAlbum}
                    aria-label={`Play ${singleAlbum.name}`}
                >
                    <i className="fa-sharp fa-solid fa-circle-play" aria-hidden="true"></i>
                </button>
                <div className="add-music-button-container">
                    {userOwned ? (
                        <OpenModalButton
                            className="icon-button"
                            aria-label="Add a song"
                            modalComponent={<AddMusicModal album={singleAlbum} type="create" />}
                        >
                            <i
                                style={{ fontSize: '35px' }}
                                className="fa-solid fa-plus"
                                aria-hidden="true"
                            ></i>
                        </OpenModalButton>
                    ) : null}
                </div>

                <div className="edit-music-button-container">
                    {userOwned && (
                        <Link
                            to={`/albums/${albumId}/edit`}
                            className="album-update-button"
                            aria-label={`Edit ${singleAlbum.name}`}
                        >
                            <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                        </Link>
                    )}
                </div>
            </div>
            <ul className="album-songs-container">
                <li className="album-songs-header">
                    <p className="song-list-heading"> &nbsp; # &nbsp; &nbsp; Title</p>
                    <i className="fa-regular fa-clock" id="album-clock-icon" aria-hidden="true"></i>
                    <span className="visually-hidden">Duration</span>
                </li>
                {songsArray.map((song) => (
                    // Clicking anywhere on the row plays the song; the number
                    // is the button that does it from the keyboard
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a mouse shortcut; SongPlayButton plays it from the keyboard
                    <li
                        key={song.id}
                        className="albums-songs-button"
                        onClick={() => handlePlaySong(song.id)}
                    >
                        <div className="number-name-container">
                            <SongPlayButton
                                song={song}
                                number={song.track_number}
                                onPlay={() => handlePlaySong(song.id)}
                            />
                            <p className="song-row-name"> &nbsp; &nbsp; {song.name}</p>
                        </div>
                        <div className="heart-time-container">
                            <div className="heart-container">
                                <LikeButton songId={song.id} />
                            </div>
                            {userOwned && (
                                // Clicks here open a modal rather than play the song
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- not a control: it only keeps clicks off the row
                                <div
                                    className="song-row-owner-buttons"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <OpenModalButton
                                        className="icon-button update-delete-music-buttons"
                                        aria-label={`Edit ${song.name}`}
                                        modalComponent={
                                            <AddMusicModal
                                                song={song}
                                                album={singleAlbum}
                                                type="update"
                                            />
                                        }
                                    >
                                        <i
                                            className="fa-solid fa-pen-to-square"
                                            aria-hidden="true"
                                        ></i>
                                    </OpenModalButton>
                                    <OpenModalButton
                                        className="icon-button update-delete-music-buttons"
                                        aria-label={`Delete ${song.name}`}
                                        modalComponent={<DeleteModal type="song" id={song.id} />}
                                    >
                                        <i
                                            className="fa-regular fa-trash-can"
                                            aria-hidden="true"
                                        ></i>
                                    </OpenModalButton>
                                </div>
                            )}
                            <p className="album-song-time">
                                {' '}
                                &nbsp; &nbsp; {secsToMins(song.duration)} &nbsp; &nbsp; &nbsp;
                                &nbsp;{' '}
                            </p>
                            {user?.id && (
                                <div className="add-plsong-button-container">
                                    <AddPLSongButton songId={song.id} userId={user.id} />
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetails;
