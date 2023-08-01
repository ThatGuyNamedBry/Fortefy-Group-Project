import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { getAllAlbumsThunk, deleteAlbumThunk } from '../../store/albums';
import { getAllSongsThunk, deleteSongAction } from '../../store/songs';
import './ProfilePage.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const allAlbums = useSelector((state) => state.albums.allAlbums);
  const allSongs = useSelector((state) => state.songs.allSongs);

  useEffect(() => {
    dispatch(getAllAlbumsThunk());
    dispatch(getAllSongsThunk());
  }, [dispatch]);

  const userAlbums = Object.values(allAlbums).filter((album) => album.user.id === user.id);
  const userSongs = Object.values(allSongs).filter((song) => song.user_id === user.id);

  // console.log("userAlbums", userAlbums)
  // console.log("userSongs", userSongs)

  const handleDeleteSong = (song) => {
    dispatch(deleteSongAction(song));
  };

  const handleUpdateSong = (song) => {
    history.push(`/albums/${song.id}/edit`);
  };

  const handleDeleteAlbum = (album) => {
    dispatch(deleteAlbumThunk(album));
  };

  const handleUpdateAlbum = (album) => {
    history.push(`/albums/${album.id}/edit`);
  };

  return (
    <div className="profile-container">
      <h1>{user?.name}</h1>

      <div className="section-container">
        <h2>Your Albums</h2>
        <div className="album-grid">
          {userAlbums.map((album) => (
            <div key={album.id} className="profile-tile-container">
              <div className="profile-tile-buttons">
                <button onClick={() => handleUpdateAlbum(album)} className='fa-solid fa-pen-to-square'></button>
                <button onClick={() => handleDeleteAlbum(album.id)} className="fa-regular fa-trash-can"></button>
              </div>
              <Link to={`/albums/${album.id}`} className="album-tile link-as-text">
                <img src={album.art} alt={album.name} className="album-image" />
                <h3>{album.name.length > 22 ? album.name.slice(0, 22) + '...' : album.name}</h3>
                <p>{album.artist}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container">
      <h2>Your Songs</h2>
      <div className="album-grid">
        {userSongs.map((song) => {
          const album = allAlbums[song.album_id];
          return (
            <div key={`${album?.id}-${song?.id}`} className="profile-tile-container">
              <div className="profile-tile-buttons">
                <button onClick={() => handleUpdateSong(song.id)} className='fa-solid fa-pen-to-square'></button>
                <button onClick={() => handleDeleteSong(song.id)} className="fa-regular fa-trash-can"></button>
              </div>
              <Link to={`/albums/${album?.id}`} className="album-tile link-as-text">
                <img src={album?.art} alt={album?.name} className="album-image" />
                <h3>{song.name}</h3>
                <p>{album?.artist}</p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>

      <div className="section-container">
        <h2>Your Playlists</h2>
        {/* <div className="playlist-grid">
        {userPlaylists.map((song) => {
            const playlist = allPlaylists[song.album_id];
            return (
              <div key={`${playlist?.id}-${playlist?.id}`} to={`/playlists/${playlist?.id}`} className="album-tile ">
                <img src={album?.art} alt={album?.name} className="album-image" />
                <h3>{song.name}</h3>
                <p>{album?.artist}</p>
                <div className="profile-tile-buttons">
                  <button onClick={() => handleUpdateSong(song.id)}>Update</button>
                  <button onClick={() => handleDeleteSong(song.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div> */}
      </div>

    </div>
  );
};

export default ProfilePage;
