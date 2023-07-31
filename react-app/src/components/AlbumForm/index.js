import { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import "./AlbumForm.css"

const AlbumForm = ({ album, formType }) => {
  const history = useHistory();
  const [artist, setArtist] = useState(album?.artist);
  const [name, setName] = useState(album?.name);

  const [errors, setErrors] = useState({});

  return (
    <div className="album-form-container">
      <form id="album-form">
        <h1>{formType === "Create Album" ? "Create a new album" : "Update your album"}</h1>
        <div class="album-field">
          <div className="field-label">
            <label htmlFor="artist">Artist</label>
            {errors.artist ? <p className="errors">{errors.artist}</p> : null}
          </div>
          <input
            id="artist"
            type="text"
            placeholder="Artist"
            onChange={e => setArtist(e.target.value)}
            value={artist}
          />
        </div>
        <div class="album-field">
          <div className="field-label">
            <label htmlFor="name">Album Name</label>
            {errors.name ? <p className="errors">{errors.name}</p> : null}
          </div>
          <input
            id="name"
            type="text"
            placeholder="Album name"
            onChange={e => setName(e.target.value)}
            value={album}
          />
        </div>

      </form>
    </div>
  )
}

export default AlbumForm
