import { useSelector } from "react-redux/";
import PlaylistForm from "../PlaylistForm";

const PlaylistCreate = () => {
    const user = useSelector(state => state.session.user);

    if (user) {
        return (
            <PlaylistForm
                formType="Create Playlist"
            />
        )
    } else {
        return <h1>You need to be logged in to that.</h1>
    }
};

export default PlaylistCreate;
