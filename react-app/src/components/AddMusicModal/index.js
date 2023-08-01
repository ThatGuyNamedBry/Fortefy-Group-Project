import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import "./AddMusicModal.css"

function AddMusicModal({ album }) {
  const dispatch = useDispatch();
  const [songName, setSongName] = useState('');
  const [trackNumber, setTrackNumber] = useState('')
  const [file1, setFile1] = useState('')
  const [errors, setErrors] = useState('');
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(file1)

    
  }

  return (
    <div className='add-music-container'>
      <form id="add-music-form"
        encType="multipart/form-data">
        <h2>Add some music to your album</h2>

        <div className="song-field-container">

          <div className="song-field">
            <div className="field-label">
              <label htmlFor="song-name">Track Name</label>
              {errors.name ? <p className="errors">{errors.name}</p> : null}
            </div>
            <input
              id="song-name"
              type="text"
              placeholder="Track name"
              onChange={e => setSongName(e.target.value)}
              value={songName}
            />
          </div>

          <div className="song-field">
            <div className="field-label">
              <label htmlFor="track-number">Track Number</label>
              {errors.track_number ? <p className="errors">{errors.track_number}</p> : null}
            </div>
            <input
              id="track-number"
              type="number"
              placeholder="Track number"
              onChange={e => setTrackNumber(e.target.value)}
              value={trackNumber}
            />
          </div>

          <div className="song-field">
            <div className="field-label">
              <label htmlFor="track-number">Upload</label>
              {errors.track_number ? <p className="errors">{errors.track_number}</p> : null}
            </div>
            <input
              id="file1"
              type="file"
              placeholder="Select file"
              onChange={e => setFile1(e.target.value)}
              value={file1}
            />
          </div>

        </div>
        <button id="submit-review-button" onClick={handleSubmit}>Submit Your Review</button>

      </form>

    </div>
  )

}

export default AddMusicModal
