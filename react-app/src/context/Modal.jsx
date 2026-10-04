import React, { useEffect, useRef, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const ModalContext = React.createContext();

export function ModalProvider({ children }) {
    const modalRef = useRef();
    const [modalContent, setModalContent] = useState(null);
    // callback function that will be called when modal is closing
    const [onModalClose, setOnModalClose] = useState(null);

    const closeModal = () => {
        setModalContent(null); // clear the modal contents
        // If callback function is truthy, call the callback function and reset it
        // to null:
        if (typeof onModalClose === 'function') {
            setOnModalClose(null);
            onModalClose();
        }
    };

    const contextValue = {
        modalRef, // reference to modal div
        modalContent, // React component to render inside modal
        setModalContent, // function to set the React component to render inside modal
        setOnModalClose, // function to set the callback function called when modal is closing
        closeModal, // function to close the modal
    };

    return (
        <>
            <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
            <div ref={modalRef} />
        </>
    );
}

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal() {
    const { modalRef, modalContent, closeModal } = useContext(ModalContext);
    const isOpen = Boolean(modalRef && modalRef.current && modalContent);
    const contentRef = useRef();
    // The provider makes a new closeModal on every render
    const closeRef = useRef(closeModal);
    closeRef.current = closeModal;

    // While open: Escape closes, and Tab cycles through the dialog instead of
    // wandering off into the page behind it. Focus starts on the dialog and
    // goes back to whatever opened it once it closes.
    useEffect(() => {
        if (!isOpen) return;
        const opener = document.activeElement;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeRef.current();
                return;
            }
            if (e.key !== 'Tab') return;
            const dialog = contentRef.current;
            const focusable = [...dialog.querySelectorAll(FOCUSABLE)];
            if (!focusable.length) {
                e.preventDefault();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const inside = dialog.contains(document.activeElement);
            if (
                e.shiftKey &&
                (!inside || document.activeElement === first || document.activeElement === dialog)
            ) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            if (opener && opener !== document.body && document.contains(opener)) opener.focus();
        };
    }, [isOpen]);

    // Named by its heading, and focused whenever the content changes: switching
    // from the login form to the signup form unmounts whatever had focus
    useEffect(() => {
        const dialog = contentRef.current;
        if (!isOpen || !dialog) return;
        const heading = dialog.querySelector('h1, h2, h3');
        if (heading) {
            if (!heading.id) heading.id = 'modal-title';
            dialog.setAttribute('aria-labelledby', heading.id);
        } else {
            dialog.removeAttribute('aria-labelledby');
        }
        if (!dialog.contains(document.activeElement)) dialog.focus();
    }, [isOpen, modalContent]);

    // If there is no div referenced by the modalRef or modalContent is not a
    // truthy value, render nothing:
    if (!isOpen) return null;

    // Render the following component to the div referenced by the modalRef
    return ReactDOM.createPortal(
        <div id="modal">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the keyboard closes the dialog with Escape */}
            <div id="modal-background" onClick={closeModal} />
            <div id="modal-content" ref={contentRef} role="dialog" aria-modal="true" tabIndex={-1}>
                {modalContent}
            </div>
        </div>,
        modalRef.current,
    );
}

export const useModal = () => useContext(ModalContext);
