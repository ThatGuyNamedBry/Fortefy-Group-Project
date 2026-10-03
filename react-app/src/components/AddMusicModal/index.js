import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { createSongThunk, updateSongThunk } from '../../store/songs';
import './AddMusicModal.css';
import { getAlbumByIdThunk } from '../../store/albums';
import { serverErrors } from '../../helpers';

// Keep these in step with the server: ALLOWED_EXTENSIONS in
// app/forms/song_form.py and MAX_CONTENT_LENGTH in app/config.py
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav'];
const MAX_UPLOAD_MB = 50;

// The server names errors after its form fields, this modal after its state
const SONG_FIELDS = { name: 'songName', track_number: 'trackNumber', song: 'file1' };

function AddMusicModal({ album, type, song }) {
    const dispatch = useDispatch();
    const [songName, setSongName] = useState(song?.name ?? '');
    const [trackNumber, setTrackNumber] = useState(song?.track_number ?? '');
    const [file1, setFile1] = useState('');
    const [disableButton, setDisableButton] = useState(false);
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const frontEndErrors = {};

        if (!songName || !trackNumber || (type === 'create' && !file1))
            frontEndErrors.empty = 'Fields with * are required.';
        if (songName && songName.length > 255)
            frontEndErrors.songName = 'Track name must not exceed 255 characters.';
        if (trackNumber && (trackNumber < 1 || !Number.isInteger(Number(trackNumber))))
            frontEndErrors.trackNumber = 'Please enter a valid track number.';
        if (type === 'create' && file1) {
            const extension = file1.name.includes('.')
                ? file1.name.split('.').pop().toLowerCase()
                : '';
            if (!AUDIO_EXTENSIONS.includes(extension))
                frontEndErrors.file1 = 'File must be .mp3, .m4a or .wav.';
            else if (file1.size > MAX_UPLOAD_MB * 1024 * 1024)
                frontEndErrors.file1 = `File must be ${MAX_UPLOAD_MB} MB or smaller.`;
        }

        if (Object.keys(frontEndErrors).length > 0) {
            setErrors(frontEndErrors);
            return;
        }

        const formData = new FormData();
        formData.append('name', songName);
        formData.append('track_number', trackNumber);

        setDisableButton(true);

        let result;
        if (type === 'create') {
            formData.append('song', file1);
            result = await dispatch(createSongThunk(album, formData));
        } else if (type === 'update') {
            result = await dispatch(updateSongThunk(song, formData));
        }

        // Stay open so the user can see what went wrong and try again
        if (result.errors) {
            setErrors(serverErrors(result.errors, SONG_FIELDS));
            setDisableButton(false);
            return;
        }

        if (type === 'create') await dispatch(getAlbumByIdThunk(album?.id));
        closeModal();
    };

    return (
        <div className="add-music-container">
            <form
                id="add-music-form"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                aria-busy={disableButton}
            >
                {type === 'create' ? (
                    <h2>Add some music to your album</h2>
                ) : (
                    <h2>Update your song's info</h2>
                )}

                <div className="song-field-container">
                    <div className="song-field">
                        <div className="field-label">
                            <label htmlFor="song-name">Track Name*</label>
                            {errors.songName ? <p className="errors">{errors.songName}</p> : null}
                        </div>
                        <input
                            id="song-name"
                            type="text"
                            placeholder="Track Name"
                            onChange={(e) => setSongName(e.target.value)}
                            value={songName}
                        />
                    </div>

                    <div className="song-field">
                        <div className="field-label">
                            <label htmlFor="track-number">Track Number*</label>
                            {errors.trackNumber ? (
                                <p className="errors">{errors.trackNumber}</p>
                            ) : null}
                        </div>
                        <input
                            id="track-number"
                            type="number"
                            placeholder="Track Number"
                            onChange={(e) => setTrackNumber(e.target.value)}
                            value={trackNumber}
                        />
                    </div>

                    {type === 'create' ? (
                        <div className="song-field">
                            <div className="field-label">
                                <label htmlFor="file1">Upload*</label>
                                {errors.file1 ? <p className="errors">{errors.file1}</p> : null}
                            </div>
                            <input
                                id="file1"
                                type="file"
                                accept={AUDIO_EXTENSIONS.map((extension) => `.${extension}`).join(
                                    ',',
                                )}
                                placeholder="Select file"
                                onChange={(e) => setFile1(e.target.files[0])}
                            />
                        </div>
                    ) : null}
                </div>

                <button id="submit-song-button" type="submit" disabled={disableButton}>
                    {disableButton ? (
                        <>
                            <span className="upload-spinner" aria-hidden="true" />{' '}
                            {type === 'create' ? 'Uploading…' : 'Saving…'}
                        </>
                    ) : type === 'create' ? (
                        'Add Song'
                    ) : (
                        'Update'
                    )}
                </button>
                {errors.empty ? <p className="errors">{errors.empty}</p> : null}
                {errors.server ? <p className="errors">{errors.server}</p> : null}
            </form>
        </div>
    );
}

export default AddMusicModal;
