import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import LoginFormModal from './components/LoginFormModal';
import SignupFormModal from './components/SignupFormModal';
import { useModal } from './context/Modal';
import { authenticate } from './store/session';
import { getCurrentUserAllPlaylistsThunk } from './store/playlists';
import Navigation from './components/Navigation';
import HomeLandingPage from './components/HomeLandingPage';
import AlbumDetails from './components/AlbumDetails';
import AudioPlayerComponent from './components/AudioPlayer';
import AlbumCreate from './components/AlbumCreate';
import AlbumUpdate from './components/AlbumUpdate';
import ProfilePage from './components/ProfilePage';
import PlaylistDetails from './components/PlaylistDetails';
import PlaylistCreate from './components/PlaylistCreate';
import LikedSongs from './components/LikedSongs';
import Footer from './components/Footer';
import SearchPage from './components/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';

// /login and /signup open the same modal as the Log In and Sign Up buttons,
// over the home page. They used to be separate, unstyled copies of the forms
// with weaker validation.
function AuthModalRedirect({ modal: ModalForm }) {
    const { setModalContent } = useModal();
    const navigate = useNavigate();
    const loggedIn = useSelector((state) => Boolean(state.session.user));

    useEffect(() => {
        if (!loggedIn) setModalContent(<ModalForm />);
        navigate('/', { replace: true });
    }, [ModalForm, loggedIn, setModalContent, navigate]);

    return null;
}

function App() {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dispatch(authenticate()).then(() => setIsLoaded(true));
    }, [dispatch]);

    // Every "add to playlist" menu lists these, so load them once per login
    // rather than once per song row
    const userId = useSelector((state) => state.session.user?.id);
    useEffect(() => {
        if (userId) dispatch(getCurrentUserAllPlaylistsThunk());
    }, [dispatch, userId]);

    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const { setModalContent } = useModal();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // A failed OAuth attempt comes back as a full page redirect rather than a
    // fetch response, so the server passes the reason as a query param. Reopen
    // the login modal to show it, then clear the param so a refresh does not
    // bring the modal straight back.
    useEffect(() => {
        const oauthError = new URLSearchParams(search).get('oauth_error');
        if (!oauthError) return;
        setModalContent(<LoginFormModal errors={{ oauth: oauthError }} />);
        navigate(pathname, { replace: true });
    }, [search, pathname, navigate, setModalContent]);

    return (
        <>
            <Navigation isLoaded={isLoaded} />
            {isLoaded && (
                <main>
                    <ErrorBoundary resetKey={pathname}>
                        <Routes>
                            <Route path="/" element={<HomeLandingPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route
                                path="/login"
                                element={<AuthModalRedirect modal={LoginFormModal} />}
                            />
                            <Route
                                path="/signup"
                                element={<AuthModalRedirect modal={SignupFormModal} />}
                            />
                            <Route path="/albums/new" element={<AlbumCreate />} />
                            <Route path="/playlists/new" element={<PlaylistCreate />} />
                            <Route path="/playlists/liked" element={<LikedSongs />} />
                            <Route path="/albums/:albumId/edit" element={<AlbumUpdate />} />
                            <Route path="/albums/:albumId" element={<AlbumDetails />} />
                            <Route path="/playlists/:playlistId" element={<PlaylistDetails />} />
                        </Routes>
                    </ErrorBoundary>
                </main>
            )}
            <Footer />
            <AudioPlayerComponent />
        </>
    );
}

export default App;
