import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';
import { PlaybackContext } from '../../context/PlaybackContext';


const AudioPlayerComponent = () => {
  const allSongs = useSelector((state) => state.songs.allSongs);
  const { currentPlaylist,
    setCurrentPlaylist,
    currentSongIndex,
    setCurrentSongIndex,
    isPlaying,
    setIsPlaying } = useContext(PlaybackContext);
  // const [currentSongIndex, setCurrentSongIndex] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
    }
  }, [currentPlaylist]);

  const handleNextSong = () => {
    if (currentSongIndex + 1 < currentPlaylist.length) {
      setCurrentSongIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  return (
    <>
      {currentPlaylist && currentPlaylist.length > 0 && (
        <AudioPlayer
          layout='stacked-reverse'
          autoPlay={true}
          showSkipControls={true}
          showJumpControls={true}
          hasDefaultKeyBindings={false}
          src={allSongs[currentPlaylist[currentSongIndex]]?.song_url}
          header={`${allSongs[currentPlaylist[currentSongIndex]]?.name} - ${allSongs[currentPlaylist[currentSongIndex]]?.artist}`}
          customAdditionalControls={[
            <img
              key="album-art"
              className="audio-player-art"
              src={allSongs[currentPlaylist[currentSongIndex]]?.album_art}
              alt={allSongs[currentPlaylist[currentSongIndex]]?.name}
            />,
          ]}
          onClickNext={handleNextSong}
          onClickPrevious={handleNextSong}
          onClickPlay={handlePlayPause}
          onClickPause={handlePlayPause}
          playing={isPlaying}
        />
      )}
    </>
  );
};

export default AudioPlayerComponent;
