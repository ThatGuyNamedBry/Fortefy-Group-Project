import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useLocation } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import LoginFormPage from "./components/LoginFormPage";
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
import Footer from "./components/Footer";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/" component={HomeLandingPage} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route path="/login" component={LoginFormPage} />
          <Route path="/signup" component={SignupFormPage} />
          <Route path="/albums/new" component={AlbumCreate} />
          <Route path="/playlists/new" component={PlaylistCreate} />
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
