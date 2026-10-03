import './SongPlayButton.css';

// The number at the start of a song row. It turns into a play icon while the
// row is hovered or has keyboard focus, and it is how the keyboard plays the
// song: the row itself only answers mouse clicks.
const SongPlayButton = ({ song, number, onPlay }) => (
    <button
        type="button"
        className="song-track-number"
        aria-label={`Play ${song.name}`}
        onClick={(e) => {
            // The row would play it a second time
            e.stopPropagation();
            onPlay();
        }}
    >
        <span className="song-track-number-text" aria-hidden="true">
            {number}
        </span>
        <i className="fa-sharp fa-solid fa-play song-track-play" aria-hidden="true"></i>
    </button>
);

export default SongPlayButton;
