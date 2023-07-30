import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAlbumsThunk } from '../../store/albums';
import './HomeLandingPage.css';

const HomeLandingPage = () => {
    const dispatch = useDispatch();
    const allAlbums = useSelector(state => state.albums.allAlbums);
    console.log('allAlbums:', allAlbums);

    useEffect(() => {
        dispatch(getAllAlbumsThunk());
    }, [dispatch]);

    const albumsPerPage = 4;
    const [startIndex, setStartIndex] = useState(0);

    const handleNextClick = () => {
        if (startIndex + albumsPerPage < Object.values(allAlbums).length) {
            setStartIndex(startIndex + albumsPerPage);
        }
    };

    const handlePrevClick = () => {
        if (startIndex - albumsPerPage >= 0) {
            setStartIndex(startIndex - albumsPerPage);
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
                    <div className="album-scroll">
                        <button onClick={handlePrevClick} disabled={startIndex === 0}>&#8249;&#8249;</button>
                        <button onClick={handleNextClick} disabled={startIndex + albumsPerPage >= Object.values(allAlbums).length}>&#8250;&#8250;</button>
                    </div>
                </div>
                <div id='all-albums-container' className="album-grid">
                    {Object.values(allAlbums)
                        .slice(startIndex, startIndex + albumsPerPage)
                        .map(album => (
                            <div key={album.id} className="album-tile">
                                <img src={album.art} alt={album.name} className="album-image" />
                                <h3>{album.name.length > 24 ? album.name.slice(0, 24) + '...' : album.name}</h3>
                                <p>{album.artist}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default HomeLandingPage;
