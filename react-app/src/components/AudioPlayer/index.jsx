import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import Artwork from '../Artwork';
import './AudioPlayer.css';
import { setIsPlaying, setCurrentSongIndex, clearQueue } from '../../store/player';

// Pressing Previous later than this into a song starts it over, as in most
// music players; pressing it again straight away goes back a song
const RESTART_THRESHOLD_SECONDS = 3;

const AudioPlayerComponent = () => {
    const currentPlaylist = useSelector((state) => state.player.currentPlaylist);
    const currentSongIndex = useSelector((state) => state.player.currentSongIndex);
    const player = useRef(null);

    const dispatch = useDispatch();

    const handleNextSong = () => {
        if (currentSongIndex + 1 < currentPlaylist.length) {
            dispatch(setCurrentSongIndex(currentSongIndex + 1));
        } else {
            dispatch(clearQueue());
        }
    };

    const handlePrevSong = () => {
        const audio = player.current?.audio.current;
        if (currentSongIndex > 0 && audio && audio.currentTime < RESTART_THRESHOLD_SECONDS) {
            dispatch(setCurrentSongIndex(currentSongIndex - 1));
        } else if (audio) {
            // The first song, or far enough in: the same src, so rewind it by hand
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    };

    const song = currentPlaylist[currentSongIndex];

    return (
        <section id="audio-player-container" aria-label="Player">
            {song && (
                <AudioPlayer
                    ref={player}
                    layout="stacked-reverse"
                    autoPlay={true}
                    showSkipControls={true}
                    showJumpControls={true}
                    src={song.song_url}
                    header={`${song.name} - ${song.artist}`}
                    customAdditionalControls={[
                        <Artwork
                            key="album-art"
                            className="audio-player-art"
                            src={song.album_art}
                            alt=""
                        />,
                    ]}
                    onClickNext={handleNextSong}
                    onClickPrevious={handlePrevSong}
                    onEnded={handleNextSong}
                    // The player plays and pauses itself; the store only follows it
                    onPlay={() => dispatch(setIsPlaying(true))}
                    onPause={() => dispatch(setIsPlaying(false))}
                    onPlayError={() => dispatch(setIsPlaying(false))}
                />
            )}
        </section>
    );
};

export default AudioPlayerComponent;
