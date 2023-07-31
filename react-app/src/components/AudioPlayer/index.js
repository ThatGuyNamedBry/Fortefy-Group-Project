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

  const handleNextSong = () => {
    const songs = Object.keys(allSongs);
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    setCurrentSong(allSongs[randomSong]);
  };

  return (
    <>
      <AudioPlayer
        layout='stacked-reverse'
        autoPlay={false}
        showSkipControls={true}
        src={currentSong?.song_url}
        header={`${currentSong?.name} - ${currentSong?.artist}`}
        customAdditionalControls={[
          <img
            key="album-art"
            className="audio-player-art"
            src={currentSong?.album_art}
          />,
        ]}
        onClickNext={handleNextSong}
      />
    </>
  );
};

export default AudioPlayerComponent;
