import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { logout } from '../../store/session';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();
    const buttonRef = useRef();
    const history = useHistory();

    const openMenu = () => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        // Escape, or tabbing past the last item, closes it too
        const closeOnEscape = (e) => {
            if (e.key !== 'Escape') return;
            setShowMenu(false);
            buttonRef.current.focus();
        };
        const closeOnFocusOut = (e) => {
            if (!ulRef.current.contains(e.target) && e.target !== buttonRef.current) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', closeMenu);
        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('focusin', closeOnFocusOut);

        return () => {
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('focusin', closeOnFocusOut);
        };
    }, [showMenu]);

    const handleLogout = async (e) => {
        e.preventDefault();
        await dispatch(logout());
        history.replace('/');
        closeMenu();
    };

    const ulClassName = 'profile-dropdown' + (showMenu ? '' : ' hidden');
    const closeMenu = () => setShowMenu(false);
    // The Log In and Sign Up buttons disappear with the menu, so the modal they
    // open returns focus here when it closes
    const closeMenuForModal = () => {
        closeMenu();
        buttonRef.current.focus();
    };

    return (
        <>
            <button
                id="profile-bttn"
                ref={buttonRef}
                onClick={openMenu}
                className="fas fa-user-circle"
                aria-label="Account menu"
                aria-expanded={showMenu}
                aria-controls="profile-dropdown"
            ></button>
            <ul className={ulClassName} ref={ulRef} id="profile-dropdown">
                {user ? (
                    <>
                        <li>{user.username}</li>
                        <li>{user.email}</li>
                        <li>
                            <Link to="/profile" onClick={closeMenu} className="nav-link-profile">
                                Your Profile
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout}>Log Out</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="loginbutton">
                            <OpenModalButton
                                buttonText="Log In"
                                onButtonClick={closeMenuForModal}
                                modalComponent={<LoginFormModal />}
                            />
                        </li>
                        <li className="signupbutton">
                            <OpenModalButton
                                buttonText="Sign Up"
                                onButtonClick={closeMenuForModal}
                                modalComponent={<SignupFormModal />}
                            />
                        </li>
                    </>
                )}
            </ul>
        </>
    );
}

export default ProfileButton;
