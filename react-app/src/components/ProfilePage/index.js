import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useHistory, Link, NavLink } from 'react-router-dom';
import { getCurrentUserAllAlbumsThunk, selectUserAlbums } from '../../store/albums';
import { getCurrentUserAllSongsThunk, selectUserSongs } from '../../store/songs';
import { getCurrentUserAllPlaylistsThunk, selectUserPlaylists } from '../../store/playlists';
import OpenModalButton from '../OpenModalButton';
import AddMusicModal from '../AddMusicModal';
import DeleteModal from '../DeleteModal';
import Carousel from '../Carousel';
import LikedSongsCover from '../LikedSongs/LikedSongsCover';
import './ProfilePage.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.session.user);
  // Each filtered to this user. The stores hold everyone's albums, songs and
  // playlists once the home page has loaded them, and this page used to list
  // all of those as "yours" until its own requests came back.
  const userAlbums = useSelector(selectUserAlbums, shallowEqual);
  const userSongs = useSelector(selectUserSongs, shallowEqual);
  const userPlaylists = useSelector(selectUserPlaylists, shallowEqual);
  const allAlbums = useSelector((state) => state.albums.allAlbums);

  useEffect(() => {
    dispatch(getCurrentUserAllAlbumsThunk());
    dispatch(getCurrentUserAllSongsThunk());
    dispatch(getCurrentUserAllPlaylistsThunk());
  }, [dispatch]);

  // The auto-generated Liked Songs playlist is pinned first in Your Playlists.
  // It is not a real playlist row, so it gets no edit/delete buttons.
  const LIKED_SONGS_TILE = { id: 'liked' };
  const playlistTiles = [LIKED_SONGS_TILE, ...userPlaylists];

  const handleUpdateAlbum = (album) => {
    history.push(`/albums/${album.id}/edit`);
  };

  const editPlaylistClick = (e) => {
    e.stopPropagation();
    alert('Edit Playlist Feature Coming Soon!');
  };

  return (
    <div className="profile-container">
      <h1>Manage Your Music</h1>
      <Carousel
        title="Your Albums"
        titleAddon={user && (
          <NavLink to="/albums/new" className="create-album-button">
            <i className="fa-solid fa-circle-plus"></i>
          </NavLink>
        )}
        items={userAlbums}
        renderItem={(album) => (
          <div className="profile-tile-container">
            <div className="profile-tile-buttons">
              <div onClick={() => handleUpdateAlbum(album)} className='update-delete-music-buttons fa-solid fa-pen-to-square'></div>
              <OpenModalButton className="icon-button update-delete-music-buttons" aria-label="Delete album" modalComponent={<DeleteModal type='album' id={album.id} />}>
                <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
              </OpenModalButton>
            </div>
            <Link to={`/albums/${album.id}`} className="album-tile link-as-text">
              <img src={album.art} alt={album.name} className="album-image" />
              <h3>{album.name.length > 22 ? album.name.slice(0, 22) + '...' : album.name}</h3>
              <p className="owner-text">{album.artist}</p>
            </Link>
          </div>
        )}
      />
      <Carousel
        title="Your Songs"
        items={userSongs}
        renderItem={(song) => {
          const album = allAlbums[song.album_id];
          return (
            <div className="profile-tile-container">
              <div className="profile-tile-buttons">
                <OpenModalButton className="icon-button update-delete-music-buttons" aria-label="Edit song" modalComponent={<AddMusicModal album={album} song={song} type="update" />}>
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                </OpenModalButton>
                <OpenModalButton className="icon-button update-delete-music-buttons" aria-label="Delete song" modalComponent={<DeleteModal type='song' id={song.id} />}>
                  <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                </OpenModalButton>
              </div>
              <Link to={`/albums/${album?.id}`} className="album-tile link-as-text">
                <img src={album?.art} alt={album?.name} className="album-image" />
                <h3>{song.name}</h3>
                <p className="owner-text">{album?.artist}</p>
              </Link>
            </div>
          );
        }}
      />
      <Carousel
        title="Your Playlists"
        titleAddon={(
          <NavLink to="/playlists/new" className="create-playlist-button">
            <i className="fa-solid fa-circle-plus"></i>
          </NavLink>
        )}
        items={playlistTiles}
        renderItem={(playlist) => {
          if (playlist.id === 'liked') {
            return (
              <div className="profile-tile-container">
                <Link to="/playlists/liked" className="album-tile link-as-text">
                  <LikedSongsCover className="album-image" />
                  <h3>Liked Songs</h3>
                  <p className='owner-text'>{user?.username}</p>
                </Link>
              </div>
            );
          }
          return (
            <div className="profile-tile-container">
              <div className="profile-tile-buttons">
                <div className='update-delete-music-buttons fa-solid fa-pen-to-square' onClick={editPlaylistClick}></div>
                <OpenModalButton className="icon-button update-delete-music-buttons" aria-label="Delete playlist" modalComponent={<DeleteModal type='playlist' id={playlist.id} />}>
                  <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                </OpenModalButton>
              </div>
              <Link to={`/playlists/${playlist.id}`} className="album-tile link-as-text">
                <img src={playlist.art} alt={playlist.title} className="album-image" />
                <h3>{playlist?.title.length > 22 ? playlist.title.slice(0, 22) + '...' : playlist.title}</h3>
                <p className='owner-text'>{playlist.user.username}</p>
              </Link>
            </div>
          );
        }}
      />
    </div>
  );
};

export default ProfilePage;
