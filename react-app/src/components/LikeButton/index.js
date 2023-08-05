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
            const index = song.likes.findIndex(like => like.user_id === user.id)
            setUserLike(index > -1 ? { ...song.likes[index], likeIndex : index } : false );
        }
    }, [song, user]);

    const likeClick = (e) => {
        e.stopPropagation();
        if (!userLike) {
            dispatch(addLikeThunk(song));
        } else {
            dispatch(removeLikeThunk(song, userLike.id, userLike.likeIndex));
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
