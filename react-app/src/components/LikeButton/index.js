import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLikeThunk, removeLikeThunk } from '../../store/songs';
import './LikeButton.css'

const LikeButton = ({ songId, playlist }) => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.session.user);
    const songs = useSelector(state => state.songs.allSongs);
    const song = songs[songId]

    const [userLike, setUserLike] = useState(false);
    const [showLike, setShowLike] = useState(true);

    useEffect(() => {
        if (!user || (user.id === song?.user_id)) {
            setShowLike(false);
            return;
        }

        console.log('song.likes:', songs);
        if (user && song) {
            setUserLike(song.likes.find(like => like.user_id === user.id));
        }
    }, [song, user, userLike]);

    const likeClick = (e) => {
        e.stopPropagation();
        if (!userLike) {
            dispatch(addLikeThunk(songId));
        } else {
            dispatch(removeLikeThunk(songId, userLike.id));
        }
    };

    return (
        <button className="like-button" onClick={likeClick} style={{visibility : showLike ? 'visible' : 'hidden'}}>
            {userLike ? <i id='filled-like-heart' className="fa-sharp fa-solid fa-heart" style={{color: "#f96262"}}></i>
            : <i className="fa-sharp fa-regular fa-heart"></i>}
        </button>
    );
};

export default LikeButton;
