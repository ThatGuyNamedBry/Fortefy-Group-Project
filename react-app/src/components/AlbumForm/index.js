import { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import "./AlbumForm.css"

const AlbumForm = ({ album, formType }) => {
  return (
    <div className="album-form-container">
      <p>{formType}</p>
    </div>
  )
}

export default AlbumForm
