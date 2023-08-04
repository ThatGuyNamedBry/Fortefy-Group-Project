// DeleteModal.js
import React from 'react';
import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import { deleteAlbumThunk } from "../../store/albums";
import { deleteSongThunk, getCurrentUserAllSongsThunk } from "../../store/songs";
import { deletePlaylistThunk } from "../../store/playlists";
import './DeleteModal.css';

function DeleteModal({ type, id }) {

  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDelete = async () => {
    if (type === 'album') {
      await dispatch(deleteAlbumThunk(id));
      await dispatch(getCurrentUserAllSongsThunk());
    } else if (type === 'song') {
      dispatch(deleteSongThunk(id));
    } else if (type === 'playlist') {
      dispatch(deletePlaylistThunk(id))
    }
    closeModal();
  }

  const handleCancel = () => {
    closeModal();
  }

  return (
    <div className="delete-modal-container">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete this {type}?</p>
      <div>
        <button className="delete-button" id="delete-button" onClick={handleDelete}>Delete</button>
        <button className="keep-button" id="keep-button" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default DeleteModal;

