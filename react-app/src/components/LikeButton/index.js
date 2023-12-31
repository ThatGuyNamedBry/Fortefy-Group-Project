import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLikeThunk, removeLikeThunk } from '../../store/songs';
import './LikeButton.css'

const LikeButton = ({ songId }) => {
    const dispatch = useDispatch();
    const songs = useSelector(state => state.songs.allSongs);
    const song = songs[songId];
    const user = useSelector(state => state.session.user);
    const [userLike, setUserLike] = useState(false);

    useEffect(() => {
        if (user?.id && song?.id) {
            setUserLike(song.likes.find(like => like.user_id === user.id));
        }
    }, [song, user, userLike])

    const likeClick = (e) => {
        e.stopPropagation();
        if (!userLike) {
            dispatch(addLikeThunk(songId));
        } else {
            dispatch(removeLikeThunk(songId, userLike.id));
        }
    };

    if (!user || (song && song.user_id === user.id)) {
        return null;
    }

    return (
        <button className="like-button" onClick={likeClick}>
            {userLike ? <i id='filled-like-heart' className="fa-sharp fa-solid fa-heart" style={{color: "#f96262"}}></i>
            : <i className="fa-sharp fa-regular fa-heart"></i>}
        </button>
    );
};

export default LikeButton;
