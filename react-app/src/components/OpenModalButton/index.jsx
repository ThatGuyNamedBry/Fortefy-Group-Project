import React from 'react';
import { useModal } from '../../context/Modal';
import './OpenModalButton.css';

function OpenModalButton({
    modalComponent, // component to render inside the modal
    buttonText, // text of the button that opens the modal
    children, // optional: content to show instead of buttonText, such as an icon
    onButtonClick, // optional: callback function that will be called once the button that opens the modal is clicked
    onModalClose, // optional: callback function that will be called once the modal is closed
    ...buttonProps // anything else for the <button>, such as className or aria-label
}) {
    const { setModalContent, setOnModalClose } = useModal();

    const onClick = () => {
        // Wrapped, or useState would call the callback as an updater right away
        // and store whatever it returned
        if (onModalClose) setOnModalClose(() => onModalClose);
        setModalContent(modalComponent);
        if (onButtonClick) onButtonClick();
    };

    return (
        <button type="button" onClick={onClick} {...buttonProps}>
            {children || buttonText}
        </button>
    );
}

export default OpenModalButton;
