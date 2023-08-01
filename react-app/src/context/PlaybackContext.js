import React, { createContext, useState } from 'react';

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <PlaybackContext.Provider
      value={{
        currentPlaylist,
        setCurrentPlaylist,
        currentSongIndex,
        setCurrentSongIndex,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};
