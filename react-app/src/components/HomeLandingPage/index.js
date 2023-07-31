import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAlbumsThunk } from '../../store/albums';
import { getAllSongsThunk } from '../../store/songs';
import './HomeLandingPage.css';

const HomeLandingPage = () => {
    const dispatch = useDispatch();
    const allAlbums = useSelector(state => state.albums.allAlbums);
    const allSongs = useSelector(state => state.songs.allSongs);

    const [sortedSongs, setSortedSongs] = useState([]);
    const [startIndexAlbums, setStartIndexAlbums] = useState(0);
    const [startIndexSongs, setStartIndexSongs] = useState(0);

    const itemsPerPage = 4;

    useEffect(() => {
        dispatch(getAllAlbumsThunk());
        dispatch(getAllSongsThunk());
    }, [dispatch]);

    useEffect(() => {
        setSortedSongs(Object.values(allSongs).sort(() => Math.random() - 0.5));
    }, [allSongs]);


    const handleNextClickAlbums = () => {
        if (startIndexAlbums + itemsPerPage < Object.values(allAlbums).length) {
            setStartIndexAlbums(startIndexAlbums + itemsPerPage);
        }
    };

    const handlePrevClickAlbums = () => {
        if (startIndexAlbums - itemsPerPage >= 0) {
            setStartIndexAlbums(startIndexAlbums - itemsPerPage);
        }
    };

    const handleNextClickSongs = () => {
        if (startIndexSongs + itemsPerPage < Object.values(allSongs).length) {
            setStartIndexSongs(startIndexSongs + itemsPerPage);
        }
    };

    const handlePrevClickSongs = () => {
        if (startIndexSongs - itemsPerPage >= 0) {
            setStartIndexSongs(startIndexSongs - itemsPerPage);
        }
    };

    return (
        <div className="home-container">
            <div className="your-library-container">
                <h2>Your Library</h2>
            </div>
            <div className="discover-music-container">
                <div className="album-grid-header">
                    <h2>All Albums</h2>
                    <div className="item-scroll">
                        <button onClick={handlePrevClickAlbums} disabled={startIndexAlbums === 0}>&#8249;&#8249;</button>
                        <button onClick={handleNextClickAlbums} disabled={startIndexAlbums + itemsPerPage >= Object.values(allAlbums).length}>&#8250;&#8250;</button>
                    </div>
                </div>
                <div id='all-albums-container' className="album-grid">
                    {Object.values(allAlbums)
                        .slice(startIndexAlbums, startIndexAlbums + itemsPerPage)
                        .map(album => (
                            <div key={album.id} className="album-tile">
                                <img src={album.art} alt={album.name} className="album-image" />
                                <h3>{album.name.length > 24 ? album.name.slice(0, 24) + '...' : album.name}</h3>
                                <p>{album.artist}</p>
                            </div>
                        ))}
                </div>
                <div className="album-grid-header">
                    <h2>Discover Songs</h2>
                    <div className="item-scroll">
                        <button onClick={handlePrevClickSongs} disabled={startIndexSongs === 0}>&#8249;&#8249;</button>
                        <button onClick={handleNextClickSongs} disabled={startIndexSongs + itemsPerPage >= sortedSongs.length}>&#8250;&#8250;</button>
                    </div>
                </div>
                <div id='all-songs-container' className="album-grid">
                    {sortedSongs
                        .slice(startIndexSongs, startIndexSongs + itemsPerPage)
                        .map(song => {
                            const album = allAlbums[song.album_id];
                            return (
                                <div key={song.id} className="album-tile">
                                    <img src={album?.art} alt={album?.name} className="album-image" />
                                    <h3>{song.name}</h3>
                                    <p>{album?.artist}</p>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default HomeLandingPage;
