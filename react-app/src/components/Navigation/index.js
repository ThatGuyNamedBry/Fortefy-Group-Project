import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }){
	const sessionUser = useSelector(state => state.session.user);

	return (
		<ul id ='NavigationContainer'>
			<li>
				<NavLink exact to="/" className="nav-link">
				<i className="fas fa-home" ></i>Home</NavLink>
			</li>
			<li>
				<span className="welcome-text">Welcome to Fortefy!</span>
			</li>
			{isLoaded && (
				<li>
					<ProfileButton user={sessionUser} />
				</li>
			)}
		</ul>
	);
}

export default Navigation;
