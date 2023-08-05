import { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createAlbumThunk, updateAlbumThunk } from "../../store/albums";
import "./AlbumForm.css"

const AlbumForm = ({ album, formType }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [artist, setArtist] = useState(album?.artist);
  const [name, setName] = useState(album?.name);
  const [year, setYear] = useState(album?.year);
  const [genre, setGenre] = useState(album?.genre);
  const [art, setArt] = useState(album?.art === 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Compact_Disc.jpg' ? '' : album?.art);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({})
    const frontEndErrorsObj = {}

    if (!artist || !name || !year || !genre) frontEndErrorsObj.empty = "Fields with * are required.";
    if (artist && artist.length > 50) frontEndErrorsObj.artist = "Artist name must not exceed 50 characters."
    if (name && name.length > 255) frontEndErrorsObj.name = "Album name must not exceed 255 characters."
    if (genre && genre.length > 50) frontEndErrorsObj.genre = "Genre must not exceed 50 characters."
    if (year && (year <= 0 || year > 9999)) frontEndErrorsObj.year = "Please enter a valid year."
    if (art && (!art.endsWith('.jpg') && !art.endsWith('.png') && !art.endsWith('.gif') && !art.endsWith('.bmp') && !art.endsWith('.svg'))) frontEndErrorsObj.art = "Image URL must end in .jpg, .png, .gif, .bmp, or .svg."

    if (Object.keys(frontEndErrorsObj).length === 0) {
      const formData = { artist, name, year, genre, art }

      if (formType === 'Create Album') {
        album = await dispatch(createAlbumThunk(formData))

      } else if (formType === 'Update Album') {
        album = await dispatch(updateAlbumThunk(album, formData))
      }

      if (album.errors) {
        setErrors(album.errors)
      } else {
        history.push(`/albums/${album.id}`);
      }

    } else {
      setErrors(frontEndErrorsObj);
    }
  }

  const handleCancelClick = (e) => {
      if (formType === 'Update Album') {
        history.push(`/profile`);
      }
      else {
        history.goBack();
      }
  }

  return (
    <div className="album-form-container">
      <form id="album-form" onSubmit={handleSubmit}>
        <h1>{formType === "Create Album" ? "Add an album" : "Update your album"}</h1>
        <div className="album-field">
          <div className="field-label">
            <label htmlFor="artist">Artist*</label>
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
        <div className="album-field">
          <div className="field-label">
            <label htmlFor="name">Album Name*</label>
            {errors.name ? <p className="errors">{errors.name}</p> : null}
          </div>
          <input
            id="name"
            type="text"
            placeholder="Album name"
            onChange={e => setName(e.target.value)}
            value={name}
          />
        </div>

        <div className="album-field">
          <div className="field-label">
            <label htmlFor="genre">Genre*</label>
            {errors.genre ? <p className="errors">{errors.genre}</p> : null}
          </div>
          <input
            id="genre"
            type="text"
            placeholder="Genre"
            onChange={e => setGenre(e.target.value)}
            value={genre}
          />
        </div>

        <div className="album-field">
          <div className="field-label">
            <label htmlFor="year">Year*</label>
            {errors.year ? <p className="errors">{errors.year}</p> : null}
          </div>
          <input
            id="year"
            type="number"
            pattern="[0-9]{4}"
            placeholder="Year"
            onChange={e => setYear(e.target.value)}
            value={year}
          />
        </div>

        <div className="album-field">
          <div className="field-label">
            <label htmlFor="art">Album art</label>
            {errors.art ? <p className="errors">{errors.art}</p> : null}
          </div>
          <input
            id="art"
            type="text"
            placeholder="Link to album art"
            onChange={e => setArt(e.target.value)}
            value={art}
          />
        </div>

        <div id="button-container">
          <button
            id="submit-button"
            type="submit"
          >{formType}
          </button>
          <button
            id="cancel-button"
            onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
        {errors.empty ? <p className="errors empty-error">{errors.empty}</p> : null}
      </form>
    </div>
  )
}

export default AlbumForm
