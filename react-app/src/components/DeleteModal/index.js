import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import { deleteAlbumThunk } from "../../store/albums";
import { deleteSpotThunk } from "../../store/songs";
import './DeleteModal.css';

function DeleteModal({ type, id }) {

  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDelete = () => {
    if (type === 'album') {
      dispatch(deleteAlbumThunk(id));
    } else if (type === 'song') {
      dispatch(deleteSpotThunk(id));
    }
    closeModal();
  }

  const handleCancel = () => {
    closeModal();
  }

  return (
    <div className="delete-modal-containter">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete this {type}?</p>
      <button className="delete-button" id="delete-button" onClick={handleDelete}>Delete</button>
      <button className="delete-button" id="keep-button" onClick={handleCancel}>Cancel</button>
    </div>
  )
}

export default DeleteModal;
