import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
	const sessionUser = useSelector(state => state.session.user);

	return (
		<ul id='NavigationContainer'>
			<li>
				<NavLink exact to="/" className="nav-link">
					<i className="fas fa-home" ></i>Home</NavLink>
			</li>
			<li id='welcome-text'>
				<span className="welcome-text-symbol">&#119185;</span>
				<span className="welcome-text">ortefy</span>
			</li>
			<li id="nav-right">
			{sessionUser && (
				<NavLink to="/albums/new" className="nav-link">
					Create Album
				</NavLink>
			)}
			{isLoaded && (
				<li>
					<ProfileButton user={sessionUser} />
				</li>
			)}
			</li>
		</ul>
	);
}

export default Navigation;
