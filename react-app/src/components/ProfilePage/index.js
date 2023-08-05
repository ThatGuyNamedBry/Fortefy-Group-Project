import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link, NavLink } from 'react-router-dom';
import { getCurrentUserAllAlbumsThunk } from '../../store/albums';
import { getCurrentUserAllSongsThunk } from '../../store/songs';
import { getCurrentUserAllPlaylistsThunk } from '../../store/playlists';
import EditSongButton from '../EditSongButton';
import AddMusicModal from '../AddMusicModal';
import DeleteModal from '../DeleteModal';
import DeleteMusicButton from '../DeleteMusicButton/DeleteMusicButton';
import './ProfilePage.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.session.user);
  const userAlbumsObject = useSelector((state) => state.albums.allAlbums);
  const userSongsObject = useSelector((state) => state.songs.allSongs);
  const userPlaylistsObject = useSelector((state) => state.playlists.allPlaylists)
  const [startIndexAlbums, setStartIndexAlbums] = useState(0);
  const [startIndexSongs, setStartIndexSongs] = useState(0);
  const [startIndexPlaylists, setStartIndexPlaylists] = useState(0);

  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentUserAllAlbumsThunk());
      dispatch(getCurrentUserAllSongsThunk());
      dispatch(getCurrentUserAllPlaylistsThunk());
    }
  }, [dispatch, user]);

  const userAlbums = Object.values(userAlbumsObject);
  const userSongs = Object.values(userSongsObject);
  const userPlaylists = Object.values(userPlaylistsObject);


  const handleNextClickAlbums = () => {
    if (startIndexAlbums + itemsPerPage < userAlbums.length) {
      setStartIndexAlbums(startIndexAlbums + itemsPerPage);
    }
  };

  const handlePrevClickAlbums = () => {
    if (startIndexAlbums - itemsPerPage >= 0) {
      setStartIndexAlbums(startIndexAlbums - itemsPerPage);
    }
  };

  const handleNextClickSongs = () => {
    if (startIndexSongs + itemsPerPage < userSongs.length) {
      setStartIndexSongs(startIndexSongs + itemsPerPage);
    }
  };

  const handlePrevClickSongs = () => {
    if (startIndexSongs - itemsPerPage >= 0) {
      setStartIndexSongs(startIndexSongs - itemsPerPage);
    }
  };

  const handleNextClickPlaylists = () => {
    if (startIndexPlaylists + itemsPerPage < userPlaylists.length) {
      setStartIndexPlaylists(startIndexPlaylists + itemsPerPage);
    }
  };

  const handlePrevClickPlaylists = () => {
    if (startIndexPlaylists - itemsPerPage >= 0) {
      setStartIndexPlaylists(startIndexPlaylists - itemsPerPage);
    }
  };

  const handleUpdateAlbum = (album) => {
    history.push(`/albums/${album.id}/edit`);
  };

  const editPlaylistClick = (e) => {
    e.stopPropagation();
    alert('Edit Playlist Feature Coming Soon!');
  };

  return (
    <div className="profile-container">
      <h1>{user?.name}</h1>
      <div className="section-container">
        <div className="header">
          <div className="inner-header">
            <h2>Your Albums</h2>
            {user && (
              <NavLink to="/albums/new" className="create-album-button">
                <i className="fa-solid fa-circle-plus"></i>
              </NavLink>
            )}
          </div>
          <div className="item-scroll">
            <div
              className={`fa-solid fa-angles-left ${startIndexAlbums === 0 ? 'disabled' : ''}`}
              onClick={handlePrevClickAlbums}
            ></div>
            <div
              className={`fa-solid fa-angles-right ${startIndexAlbums + itemsPerPage >= userAlbums.length ? 'disabled' : ''}`}
              onClick={handleNextClickAlbums}
            ></div>
          </div>

        </div>
        <div className="album-grid">
          {userAlbums
            .slice(startIndexAlbums, startIndexAlbums + itemsPerPage)
            .map((album) => (
              <div key={album?.id} className="profile-tile-container">
                <div className="profile-tile-buttons">
                  <div onClick={() => handleUpdateAlbum(album)} className='update-delte-music-buttons fa-solid fa-pen-to-square'></div>
                  <DeleteMusicButton className="delete-song-modal" modalComponent={<DeleteModal type='album' id={album.id} />} />
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
        <div className="header">
          <div className="inner-header">
            <h2>Your Songs</h2>
          </div>
          <div className="item-scroll">
            <div
              className={`fa-solid fa-angles-left ${startIndexSongs === 0 ? 'disabled' : ''}`}
              onClick={handlePrevClickSongs}
            ></div>
            <div
              className={`fa-solid fa-angles-right ${startIndexSongs + itemsPerPage >= userSongs.length ? 'disabled' : ''}`}
              onClick={handleNextClickSongs}
            ></div>
          </div>

        </div>
        <div className="album-grid">
          {userSongs
            .slice(startIndexSongs, startIndexSongs + itemsPerPage)
            .map((song) => {
              const album = userAlbumsObject[song.album_id]
              return (
                <div key={`${album?.id}-${song?.id}`} className="profile-tile-container">
                  <div className="profile-tile-buttons">
                    <EditSongButton modalComponent={<AddMusicModal className="add-music-modal" album={album} song={song} type="update" />} />
                    <DeleteMusicButton modalComponent={<DeleteModal className="delete-song-modal" type='song' id={song.id} />} />
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
        <div className='header'>
          <div className='inner-header'>
            <h2>Your Playlists</h2>
            <NavLink to="/playlists/new" className="create-playlist-button">
              <i className="fa-solid fa-circle-plus"></i>
            </NavLink>
          </div>
          <div className="item-scroll">
            <div
              className={`fa-solid fa-angles-left ${startIndexPlaylists === 0 ? 'disabled' : ''}`}
              onClick={handlePrevClickPlaylists}
            ></div>
            <div
              className={`fa-solid fa-angles-right ${startIndexPlaylists + itemsPerPage >= userPlaylists.length ? 'disabled' : ''}`}
              onClick={handleNextClickPlaylists}
            ></div>
          </div>

        </div>
        <div className="album-grid">
          {userPlaylists
            .slice(startIndexPlaylists, startIndexPlaylists + itemsPerPage)
            .map((playlist) => (
              <div key={playlist?.id} className="profile-tile-container">
                <div className="profile-tile-buttons">
                  <div className='update-delte-music-buttons fa-solid fa-pen-to-square' onClick={editPlaylistClick}>
                    {/* Edit Playlist Modal Here (Optional) */}
                  </div>
                  <DeleteMusicButton className="delete-song-modal" modalComponent={<DeleteModal type='playlist' id={playlist.id} />} />
                </div>
                <Link to={`/playlists/${playlist.id}`} className="album-tile link-as-text">
                  <img src={playlist?.art} alt={playlist?.name} className="album-image" />
                  <h3>{playlist?.title.length > 22 ? playlist.title.slice(0, 22) + '...' : playlist.title}</h3>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
