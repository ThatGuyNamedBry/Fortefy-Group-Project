import React from 'react';
import { useModal } from '../../context/Modal';
import "./DeleteMusicButton.css";

function DeleteMusicButton({
  modalComponent, // component to render inside the modal
  onButtonClick, // optional: callback function that will be called once the button that opens the modal is clicked
  onModalClose // optional: callback function that will be called once the modal is closed
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);
    if (onButtonClick) onButtonClick();
  };

  return (
    <i onClick={onClick} className="delete-music-button fa-regular fa-trash-can"></i>
  );
}

export default DeleteMusicButton;
