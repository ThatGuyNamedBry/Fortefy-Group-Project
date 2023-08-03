import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { createPlaylistThunk, updatePlaylistThunk } from "../../store/playlists";
import { playlistValidation } from "../../helpers";
import './PlaylistForm.css';

const PlaylistForm = ({ formType, playlist }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [art, setArt] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        //Error validation from helper
        const frontEndErrorsObject = playlistValidation(title, art, description);
        setErrors(frontEndErrorsObject);

        // Has a flag of true if errors are present
        if (!frontEndErrorsObject.flag) {
            const formData = { title, art, description };
            if (formType === 'Create Playlist') {
                playlist = await dispatch(createPlaylistThunk(formData));
            } else if (formType === 'Update Playlist') {
                playlist = await dispatch(updatePlaylistThunk(playlist.id, formData));
            }

            if (playlist?.errors) {
                setErrors(playlist.errors)
            } else {
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
                        <label htmlFor="playlist-title">Playlist Name</label>
                        {errors.title ? <p className="errors">{errors.title}</p> : null}
                    </div>
                    <input
                        id="playlist-title"
                        type="text"
                        placeholder="Playlist Name"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />
                </div>
                <div className="album-field">
                    <div className="field-label"></div>
                </div>
            </form>
        </div>
    )
}

export default PlaylistForm;
