import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';
import { setIsPlaying, setCurrentPlaylist, setCurrentSongIndex } from '../../store/player';

const AudioPlayerComponent = () => {
  const currentPlaylist = useSelector((state) => state.player.currentPlaylist);
  const currentSongIndex = useSelector((state) => state.player.currentSongIndex);
  const isPlaying = useSelector((state) => state.player.isPlaying);

  const dispatch = useDispatch();

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.length > 0) {
      dispatch(setIsPlaying(true));
    }
  }, [currentPlaylist, dispatch]);

  const handleNextSong = () => {
    if (currentSongIndex + 1 < currentPlaylist.length) {
      dispatch(setIsPlaying(true));
      dispatch(setCurrentSongIndex(currentSongIndex + 1));
    } else {
      dispatch(setIsPlaying(false));
      dispatch(setCurrentPlaylist({}));
    }
  };

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  return (
    <div id="audio-player-container">
      {currentPlaylist && currentPlaylist.length > 0 && (
        <AudioPlayer
          layout='stacked-reverse'
          autoPlay={true}
          showSkipControls={true}
          showJumpControls={true}
          hasDefaultKeyBindings={false}
          src={currentPlaylist[currentSongIndex]?.song_url}
          header={`${currentPlaylist[currentSongIndex]?.name} - ${currentPlaylist[currentSongIndex]?.artist}`}
          customAdditionalControls={[
            <img
              key="album-art"
              className="audio-player-art"
              src={currentPlaylist[currentSongIndex]?.album_art}
              alt={currentPlaylist[currentSongIndex]?.name}
            />,
          ]}
          onClickNext={handleNextSong}
          onClickPrevious={handleNextSong}
          onClickPlay={handlePlayPause}
          onClickPause={handlePlayPause}
          playing={isPlaying}
        />
      )}
    </div>
  );
};

export default AudioPlayerComponent;
