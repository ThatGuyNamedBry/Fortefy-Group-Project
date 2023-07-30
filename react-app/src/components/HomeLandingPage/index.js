import React, { useEffect } from 'react';
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

  return (
    <div className="home-container">
      <div className="your-library-container">
        <h2>Your Library</h2>
      </div>
      <div className="discover-music-container">
        <h2>All Albums</h2>
        <div id='all-albums-container'>
        {Object.values(allAlbums).map(album => (
          <div key={album.id} className="album-item">
            <img src={album.art} alt={album.name} className="album-image" />
            <h3>{album.name}</h3>
            <p>{album.artist}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default HomeLandingPage;
