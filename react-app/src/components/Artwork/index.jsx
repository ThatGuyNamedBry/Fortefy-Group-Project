import { useEffect, useState } from 'react';

// Served from react-app/public, so nothing depends on another site keeping a
// file up or allowing it to be hotlinked
export const DEFAULT_ALBUM_ART = '/images/default-album.svg';
export const DEFAULT_PLAYLIST_ART = '/images/default-playlist.svg';

// A playlist without its own art shows its first song's album cover, the
// way Spotify does, and an empty one shows the default
export const playlistArt = (playlist) => {
    if (playlist?.art) return playlist.art;
    const firstSong = playlist?.playlist_songs?.[0]?.song;
    if (firstSong) return firstSong.album_art || DEFAULT_ALBUM_ART;
    return DEFAULT_PLAYLIST_ART;
};

/**
 * An album or playlist cover. Albums and playlists without art store none
 * (null), and this shows the fallback for them, and for any art whose URL
 * has stopped working, rather than a broken image.
 */
const Artwork = ({ src, fallback = DEFAULT_ALBUM_ART, alt, ...props }) => {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    return (
        <img
            src={!src || failed ? fallback : src}
            alt={alt}
            onError={() => setFailed(true)}
            {...props}
        />
    );
};

export default Artwork;
