import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAlbumByIdThunk } from '../../store/albums';
import AlbumForm from "../AlbumForm";

const AlbumUpdate = () => {
  const dispatch = useDispatch();
  let { albumId } = useParams()
  const album = useSelector((state) =>
    state.albums.singleAlbum[albumId] ? state.albums.singleAlbum[albumId] : null
  );

  const user = useSelector((state) =>
    state.session.user ? state.session.user : null
  );

  useEffect(() => {
    dispatch(getAlbumByIdThunk(albumId));
  }, [dispatch, albumId]);

  if (!album) return (<h1>Album does not exist</h1>);


  if (album.user.id === user.id) {
    return (
      Object.keys(album).length > 1 && (
        <AlbumForm
          album={album}
          formType="Update Album"
        />
      )
    )
  } else {
    return <h1>You do not have permission to do that.</h1>
  }
};

export default AlbumUpdate
