import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAlbumsThunk } from '../../store/albums';
import { getAllSongsThunk } from '../../store/songs';
import './ProfilePage.css';

const ProfilePage = () => {
const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const allAlbums = useSelector((state) => state.albums.allAlbums);
  const allSongs = useSelector((state) => state.songs.allSongs);

  useEffect(() => {
    dispatch(getAllAlbumsThunk());
    dispatch(getAllSongsThunk());
}, [dispatch]);

  const userAlbums = Object.values(allAlbums).filter((album) => album.user.id === user.id);
  const userSongs = Object.values(allSongs).filter((song) => song.user_id === user.id);


console.log("userAlbums", userAlbums)
console.log("userSongs", userSongs)
  return (
    <div className="profile-container">
      <h1>{user?.name}</h1>

      <div className="section-container">
        <h2>Your Albums</h2>
        <div className="album-grid">
          {userAlbums.map((album) => (
            <div key={album.id} to={`/albums/${album.id}`} className="album-tile">
              <img src={album.art} alt={album.name} className="album-image" />
              <h3>{album.name.length > 24 ? album.name.slice(0, 24) + '...' : album.name}</h3>
              <p>{album.artist}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container">
        <h2>Your Songs</h2>
        <div className="song-grid">
          {userSongs.map((song) => {
            const album = allAlbums[song.album_id];
            return (
              <div key={`${album?.id}-${song?.id}`} to={`/albums/${album?.id}`} className="album-tile ">
                <img src={album?.art} alt={album?.name} className="album-image" />
                <h3>{song.name}</h3>
                <p>{album?.artist}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-container">
        <h2>Your Playlists</h2>
        <div className="playlist-grid">
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
