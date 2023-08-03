import React, { useEffect } from 'react';
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

  useEffect(() => {
    dispatch(getCurrentUserAllAlbumsThunk());
    dispatch(getCurrentUserAllSongsThunk());
    dispatch(getCurrentUserAllPlaylistsThunk());
  }, [dispatch]);

  const userAlbums = Object.values(userAlbumsObject);
  const userSongs = Object.values(userSongsObject);
  const userPlaylists = Object.values(userPlaylistsObject);

  const handleUpdateAlbum = (album) => {
    history.push(`/albums/${album.id}/edit`);
  };

  return (
    <div className="profile-container">
      <h1>{user?.name}</h1>
      <div className="section-container">
        <div className="header">
        <h2>Your Albums</h2>
        {user && (
				<NavLink to="/albums/new" className="create-album-button">
					<i class="fa-solid fa-circle-plus"></i>
				</NavLink>
			  )}
        </div>
        <div className="album-grid">
          {userAlbums.map((album) => (
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
        <h2>Your Songs</h2>
      </div>
        <div className="album-grid">
          {userSongs.map((song) => {
            const album = userAlbumsObject[song.album_id]
            return (
              <div key={`${album?.id}-${song?.id}`} className="profile-tile-container">
                <div className="profile-tile-buttons">
                  <EditSongButton modalComponent={<AddMusicModal className="add-music-modal" album={album} song={song} type="update"/>}/>
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
          <h2>Your Playlists</h2>
          <div className="create-playlist-button">
            <i class="fa-solid fa-circle-plus"></i>
          </div>
        </div>
        <div className="album-grid">
        {userPlaylists.map((playlist) => (
            <div key={playlist?.id} className="profile-tile-container">
              <div className="profile-tile-buttons">
                <div className='update-delte-music-buttons fa-solid fa-pen-to-square'>
                  {/* Edit Playlist Modal Here (Optional) */}
                </div>
                <div className="update-delte-music-buttons fa-regular fa-trash-can">
                  {/* Delete Playlist Modal Here */}
                </div>
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
