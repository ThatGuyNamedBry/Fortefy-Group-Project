import { useSelector } from "react-redux/";
import AlbumForm from "../AlbumForm";

const AlbumCreate = () => {

  const user = useSelector((state) =>
    state.session.user ? state.session.user : null
  );

  if (user) {
    return (
      <div className="page-wrapper">
        <AlbumForm
          formType="Create Album"
        />
      </div>
    )
  } else {
    return <h1>You need to be logged in to do that.</h1>
  }
};

export default AlbumCreate;
