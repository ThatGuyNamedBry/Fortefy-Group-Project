import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './LikeButton.css'

const LikeButton = ({ songId }) => {
    const dispatch = useDispatch();
    const song = useSelector(state => state.songs.singleSong['songId']);
    const user = useSelector(state => state.session.user);
    const [isLiked, setIsLiked] = useState('');
    useEffect(() => {
        const likes = song.likes;
        if (user) {
            const userLike = likes.find(like => like.user_id === user.id);
            setIsLiked(userLike ? 'fill' : '');
        }
    }, [song, user])
    const likeClick = (e) => {
        e.stopPropogation();

    };

    if (!user || (song && song.user_id === user.id)) {
        return null;
    }

    return (
        <button className={`like-button${isLiked}`} onClick={likeClick}>**LikeButton**</button>
    );
};

export default LikeButton;
