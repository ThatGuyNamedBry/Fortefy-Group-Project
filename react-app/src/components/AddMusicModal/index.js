import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { createSongThunk, getAllSongsAction, getAllSongsThunk, updateSongThunk } from '../../store/songs';
import "./AddMusicModal.css"
import { getAlbumByIdThunk } from '../../store/albums';

function AddMusicModal({ album, type, song }) {
  const dispatch = useDispatch();
  const [songName, setSongName] = useState(song?.name);
  const [trackNumber, setTrackNumber] = useState(song?.track_number)
  const [file1, setFile1] = useState('')
  const [disableButton, setDisableButton] = useState(false)
  const [errors, setErrors] = useState('');
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const frontEndErrors = {}

    if (!songName || !trackNumber || !file1) frontEndErrors.empty = "Fields with * are required."
    if (songName && songName.length > 255) frontEndErrors.songName = "Track name must not exceed 255 characters."
    if (trackNumber && (trackNumber < 1 || !Number.isInteger(Number(trackNumber)))) frontEndErrors.trackNumber = "Please enter a valid track number."
    if (file1 && !file1.name.endsWith('.mp3')) frontEndErrors.file1 = "File must be .mp3."

    if (Object.keys(frontEndErrors).length === 0) {

      if (type === 'create') {
        const formData = new FormData()
        formData.append('name', songName)
        formData.append('track_number', trackNumber)
        formData.append('song', file1)

        setDisableButton(true)

        await dispatch(createSongThunk(album, formData))
        await dispatch(getAlbumByIdThunk(album?.id))

      } else if (type === 'update') {

        const formData = new FormData()
        formData.append('name', songName)
        formData.append('track_number', trackNumber)

        await dispatch(updateSongThunk(song, formData))

      }
      closeModal();
    } else {
      setErrors(frontEndErrors)
    }
  }

  return (
    <div className='add-music-container'>
      <form id="add-music-form"
        encType="multipart/form-data">
        {type === 'create' ? <h2>Add some music to your album</h2> : <h2>Update your song's info</h2>}

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
              onChange={e => setSongName(e.target.value)}
              value={songName}
            />
          </div>

          <div className="song-field">
            <div className="field-label">
              <label htmlFor="track-number">Track Number*</label>
              {errors.trackNumber ? <p className="errors">{errors.trackNumber}</p> : null}
            </div>
            <input
              id="track-number"
              type="number"
              placeholder="Track Number"
              onChange={e => setTrackNumber(e.target.value)}
              value={trackNumber}
            />
          </div>

          {type === 'create' ?
            <div className="song-field">
              <div className="field-label">
                <label htmlFor="track-number">Upload*</label>
                {errors.file1 ? <p className="errors">{errors.file1}</p> : null}
              </div>
              <input
                id="file1"
                type="file"
                placeholder="Select file"
                onChange={e => setFile1(e.target.files[0])}
              />
            </div>
            : null
          }
        </div>

        <button id="submit-song-button" onClick={handleSubmit} disabled={disableButton}> {type === 'create' ? 'Add Song' : 'Update'} </button>
        {errors.empty ? <p className="errors">{errors.empty}</p> : null}
      </form>
    </div>
  )
}

export default AddMusicModal
