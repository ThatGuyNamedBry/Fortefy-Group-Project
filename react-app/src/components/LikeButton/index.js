import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLikeThunk, removeLikeThunk } from '../../store/songs';
import './LikeButton.css'

const LikeButton = ({ songId }) => {
    const dispatch = useDispatch();
    const song = useSelector(state => state.songs.allSongs['songId']);
    const user = useSelector(state => state.session.user);
    const [userLike, setUserLike] = useState(false)
    const [isLiked, setIsLiked] = useState('');
    useEffect(() => {
        setIsLiked('');
        if (user && song) {
            setUserLike(song.likes.find(like => like.user_id === user.id));
            setIsLiked(userLike ? 'fill' : '');
        }
    }, [song, user])
    const likeClick = (e) => {
        e.stopPropagation();
        if (!isLiked) {
            dispatch(addLikeThunk(songId));
        } else {
            dispatch(removeLikeThunk(songId, userLike.id));
        }
    };

    if (!user || (song && song.user_id === user.id)) {
        return null;
    }

    return (
        <button className={`like-button${isLiked}`} onClick={likeClick}>**LikeButton**</button>
    );
};

export default LikeButton;
