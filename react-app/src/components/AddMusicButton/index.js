import React from 'react';
import { useModal } from '../../context/Modal';

function AddMusicButton({
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
    <i onClick={onClick} style={{ fontSize: "35px" }} className="fa-solid fa-plus"></i>
  );
}

export default AddMusicButton;
