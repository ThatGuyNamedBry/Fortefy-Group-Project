import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { createPlaylistThunk, updatePlaylistThunk } from "../../store/playlists";
import { playlistValidation } from "../../helpers";
import './PlaylistForm.css';

const PlaylistForm = ({ playlist, formType }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [art, setArt] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        //Error validation from helpers.js
        const frontEndErrorsObject = playlistValidation(title, art, description);
        setErrors(frontEndErrorsObject);

        // Has a flag of true if errors are present
        if (!frontEndErrorsObject.flag) {
            const formData = { title, art, description };
            if (formType === 'Create Playlist') {
                playlist = await dispatch(createPlaylistThunk(formData));
            } else if (formType === 'Update Playlist') {
                // playlist = await dispatch(updatePlaylistThunk(playlist.id, formData));
            }

            if (playlist?.errors) {
                setErrors({ ...playlist.errors, flag: true } );
            } else {
                console.log('playlist : ', playlist);
                history.push(`/playlists/${playlist.id}`);
            }
        }
    }

    return (
        <div className="playlist-form-container">
            <form id="playlist-form" onSubmit={handleSubmit}>
                <h1>{formType}</h1>

                <div className="playlist-field">
                    <div className="field-label">
                        <label htmlFor="playlist-title-input">Playlist Name*</label>
                        {errors.title ? <p className="errors">{errors.title}</p> : null}
                    </div>
                    <input
                        id="playlist-title-input"
                        type="text"
                        placeholder="Playlist Name"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        required
                    />
                </div>

                <div className="playlist-field">
                    <div className="field-label">
                        <label htmlFor="playlist-art-input">Cover Art</label>
                        {errors.art ? <p className="errors">{errors.art}</p> : null}
                    </div>
                    <input
                        id="playlist-art-input"
                        type="text"
                        placeholder="(Optional) Cover Art URL"
                        onChange={(e) => setArt(e.target.value)}
                        value={art}
                    />
                </div>

                <div className="playlist-field">
                    <div className="field-label">
                        <label htmlFor="playlist-description-input">Description</label>
                        {errors.description ? <p className="errors">{errors.description}</p> : null}
                    </div>
                    <textarea
                        id="playlist-description-input"
                        placeholder="(Optional) Share some thoughts about the playlist"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    />
                </div>

                <div id="submit-playlist-container">
                    <button
                        id="submit-playlist-button"
                        type="submit"
                    >{formType}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PlaylistForm;
