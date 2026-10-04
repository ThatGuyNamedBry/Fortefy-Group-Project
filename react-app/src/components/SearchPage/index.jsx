import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { searchThunk, clearSearchResultsAction } from '../../store/search';
import { setCurrentPlaylist, setCurrentSongIndex } from '../../store/player';
import { secsToMins } from '../../helpers';
import LikeButton from '../LikeButton';
import AddPLSongButton from '../AddPLSongButton';
import Artwork from '../Artwork';
import './SearchPage.css';

const SearchPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const query = (new URLSearchParams(location.search).get('q') || '').trim();

    const user = useSelector((state) => state.session.user);
    const { songs, albums, isLoading, error } = useSelector((state) => state.search);

    useEffect(() => {
        if (query) {
            dispatch(searchThunk(query));
        } else {
            dispatch(clearSearchResultsAction());
        }
    }, [dispatch, query]);

    const handlePlaySong = (index) => {
        // Queue every song result so playback continues down the list
        dispatch(setCurrentPlaylist(songs));
        dispatch(setCurrentSongIndex(index));
    };

    const stopClick = (e) => e.stopPropagation();

    if (!query) {
        return (
            <div className="search-page">
                <h1>Search</h1>
                <p className="search-status">
                    Type in the search bar above to find songs by name or artist, and albums by name
                    or artist.
                </p>
            </div>
        );
    }

    const hasResults = songs.length > 0 || albums.length > 0;

    return (
        <div className="search-page">
            <h1>Results for &ldquo;{query}&rdquo;</h1>

            {error && (
                <p className="search-status">
                    Something went wrong while searching. Please try again.
                </p>
            )}
            {!error && isLoading && !hasResults && (
                <p className="search-status">Searching&hellip;</p>
            )}
            {!error && !isLoading && !hasResults && (
                <div className="search-status">
                    <p>No songs or albums found for &ldquo;{query}&rdquo;.</p>
                    <p>Check the spelling, or try a different song, album, or artist name.</p>
                </div>
            )}

            {songs.length > 0 && (
                <section className="search-section">
                    <h2>Songs</h2>
                    <ul className="search-song-list">
                        {songs.map((song, index) => (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a mouse shortcut; the play button plays it from the keyboard
                            <li
                                key={song.id}
                                className="search-song-row"
                                onClick={() => handlePlaySong(index)}
                            >
                                <div className="search-song-art-wrapper">
                                    <Artwork
                                        className="search-song-art"
                                        src={song.album_art}
                                        alt=""
                                    />
                                    <button
                                        type="button"
                                        className="search-song-play"
                                        aria-label={`Play ${song.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaySong(index);
                                        }}
                                    >
                                        <i className="fa-sharp fa-solid fa-play"></i>
                                    </button>
                                </div>
                                <div className="search-song-text">
                                    <span className="search-song-name">{song.name}</span>
                                    <span className="search-song-sub">
                                        {song.artist} &middot;{' '}
                                        <Link to={`/albums/${song.album_id}`} onClick={stopClick}>
                                            {song.album_name}
                                        </Link>
                                    </span>
                                </div>
                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- not a control: it only keeps clicks off the row */}
                                <div className="search-song-actions" onClick={stopClick}>
                                    <LikeButton songId={song.id} />
                                    <span className="search-song-duration">
                                        {secsToMins(song.duration)}
                                    </span>
                                    {user && <AddPLSongButton songId={song.id} userId={user.id} />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {albums.length > 0 && (
                <section className="search-section">
                    <h2>Albums</h2>
                    <div className="search-album-grid">
                        {albums.map((album) => (
                            <Link
                                key={album.id}
                                to={`/albums/${album.id}`}
                                className="album-tile link-as-text"
                            >
                                <Artwork src={album.art} alt="" className="album-image" />
                                <h3>{album.name}</h3>
                                <p className="owner-text">
                                    {album.artist} &middot; {album.year}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchPage;
