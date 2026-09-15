import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import LoginFormPage from "./components/LoginFormPage";
import LoginFormModal from "./components/LoginFormModal";
import { useModal } from "./context/Modal";
import { authenticate } from "./store/session";
import Navigation from "./components/Navigation";
import HomeLandingPage from "./components/HomeLandingPage";
import AlbumDetails from "./components/AlbumDetails";
import AudioPlayerComponent from "./components/AudioPlayer";
import AlbumCreate from "./components/AlbumCreate";
import AlbumUpdate from "./components/AlbumUpdate";
import ProfilePage from "./components/ProfilePage";
import PlaylistDetails from "./components/PlaylistDetails";
import PlaylistCreate from "./components/PlaylistCreate";
import LikedSongs from "./components/LikedSongs";
import Footer from "./components/Footer";
import SearchPage from "./components/SearchPage";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const { pathname, search } = useLocation();
  const history = useHistory();
  const { setModalContent } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // A failed OAuth attempt comes back as a full page redirect rather than a
  // fetch response, so the server passes the reason as a query param. Reopen
  // the login modal to show it, then clear the param so a refresh does not
  // bring the modal straight back.
  useEffect(() => {
    const oauthError = new URLSearchParams(search).get("oauth_error");
    if (!oauthError) return;
    setModalContent(<LoginFormModal errors={{ oauth: oauthError }} />);
    history.replace(pathname);
  }, [search, pathname, history, setModalContent]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/" component={HomeLandingPage} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/search" component={SearchPage} />
          <Route path="/login" component={LoginFormPage} />
          <Route path="/signup" component={SignupFormPage} />
          <Route path="/albums/new" component={AlbumCreate} />
          <Route path="/playlists/new" component={PlaylistCreate} />
          <Route exact path="/playlists/liked" component={LikedSongs} />
          <Route path="/albums/:albumId/edit" component={AlbumUpdate} />
          <Route path="/albums/:albumId" component={AlbumDetails} />
          <Route path="/playlists/:playlistId" component={PlaylistDetails} />
        </Switch>
      )}
      <Footer />
      <AudioPlayerComponent />
    </>
  );
}

export default App;
