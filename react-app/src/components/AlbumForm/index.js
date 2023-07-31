import { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import "./AlbumForm.css"

const AlbumForm = ({ album, formType }) => {
  const history = useHistory();
  const [artist, setArtist] = useState(album?.artist);
  const [name, setName] = useState(album?.name);
  const [year, setYear] = useState(album?.year);
  const [genre, setGenre] = useState(album?.genre);
  const [art, setArt] = useState(album?.art);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({})
    const frontEndErrorsObj = {}

    if (!artist) frontEndErrorsObj.artist = "Artist is required";
    if (!name) frontEndErrorsObj.name = "Name is required";
    if (!year) frontEndErrorsObj.year = "Year is required";
    if (!genre) frontEndErrorsObj.genre = "Genre is required";

    if (Object.keys(frontEndErrorsObj).length === 0) {
      if (formType === 'Create Album') {
        console.log('ready to create')

      } else if (formType === 'Update Album') {
        console.log('ready to update')
      }

    } else {
      setErrors(frontEndErrorsObj);
    }


  }


  return (
    <div className="album-form-container">
      <form id="album-form" onSubmit={handleSubmit}>
        <h1>{formType === "Create Album" ? "Add an album" : "Update your album"}</h1>
        <div className="album-field">
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
        <div className="album-field">
          <div className="field-label">
            <label htmlFor="name">Album Name</label>
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
            <label htmlFor="genre">Genre</label>
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
            <label htmlFor="year">Year</label>
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

        <div id="submit-container">
          <button
            id="submit-button"
            type="submit"
          >{formType}
          </button>
        </div>

      </form>
    </div>
  )
}

export default AlbumForm
