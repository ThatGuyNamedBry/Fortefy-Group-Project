import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import LoginFormPage from "./components/LoginFormPage";
import { authenticate } from "./store/session";
import Navigation from "./components/Navigation";
import HomeLandingPage from "./components/HomeLandingPage";
import AlbumDetails from "./components/AlbumDetails";
import AudioPlayerComponent from "./components/AudioPlayer";
import AlbumCreate from "./components/AlbumCreate";
import AlbumUpdate from "./components/AlbumUpdate";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/" component={HomeLandingPage}/>
          <Route path="/login" component={LoginFormPage}/>
          <Route path="/signup" component={SignupFormPage}/>
          <Route path="/albums/new" component={AlbumCreate}/>
          <Route path="/albums/:albumId/edit" component={AlbumUpdate}/>
          <Route path="/albums/:albumId" component={AlbumDetails}/>
        </Switch>
      )}
        <AudioPlayerComponent />
    </>
  );
}

export default App;

// const [audioSrc, setAudioSrc] = useState(null);
// const [title, setTitle] = useState(null);
// const singleSong = useSelector((state) => state.songs.singleSong);

// useEffect(() => {
  //   if (singleSong) {
    //     setAudioSrc(singleSong.song_url);
    //     setTitle(singleSong.title);
    //   }
    // }, [singleSong]);
