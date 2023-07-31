import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';

const AudioPlayerComponent = ({ audioSrc, title }) => {
  return (
    <AudioPlayer
      autoPlay={false}
      src={audioSrc}
      header={title}
      showJumpControls={false}
      customAdditionalControls={[]}
    />
  );
};

export default AudioPlayerComponent;
