import './PlaylistDetails.css';

const PlaylistDetails = () => {
    return (
        <div className='playlist-details-container'>
            <div className='playlist-header-container'>
                <img className='playlist-details-art' src={'https://i0.wp.com/olumuse.org/wp-content/uploads/2020/09/unnamed.jpg'} alt='No Playlist Image'></img>
                <div className='playlist-info-container'>
                    <p>Playlist</p>
                    <h3 className='playlist-title-header'>singlePlaylist.title</h3>
                    <p>** Artists, Playlist Length and Time go here **</p>
                </div>
            </div>
        </div>
    )
}

export default PlaylistDetails;
