import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import SearchBar from '../SearchBar';
import './Navigation.css';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector((state) => state.session.user);

    return (
        <nav aria-label="Main">
            <ul id="NavigationContainer">
                <li id="nav-left">
                    <NavLink end to="/" className="nav-link">
                        <i className="fas fa-home" aria-hidden="true"></i>Home
                    </NavLink>
                    <SearchBar />
                </li>
                <li id="welcome-text">
                    {/* <span className="welcome-text-symbol">ƒ</span> */}
                    <span className="welcome-text">ƒorteƒy</span>
                </li>
                <li id="nav-right">
                    {sessionUser && (
                        <NavLink to="/albums/new" className="nav-link">
                            Create Album
                        </NavLink>
                    )}
                    {isLoaded && (
                        <div>
                            <ProfileButton user={sessionUser} />
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
