import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';

const AudioPlayerComponent = () => {
  const allSongs = useSelector((state) => state.songs.allSongs);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    if (!currentSong) {
      const songs = Object.keys(allSongs);
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      setCurrentSong(allSongs[randomSong]);
    }
  }, [allSongs, currentSong]);

  return (
    <>
      <AudioPlayer
        autoPlay={true}
        showJumpControls={true}
        src={currentSong?.song_url}
        header={currentSong?.title}
      />
    </>
  );
};

export default AudioPlayerComponent;
