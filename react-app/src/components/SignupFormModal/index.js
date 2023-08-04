import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { signUp } from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
	const dispatch = useDispatch();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	// const [errors, setErrors] = useState({});
	const { closeModal } = useModal();
	const [validationObject, setValidationObject] = useState({});


	const handleSubmit = async (e) => {
		e.preventDefault();
		const errorsObject = {};
		// setErrors({});

		if (!email) {
			errorsObject.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errorsObject.email = "Invalid email format";
		}

		if (!username) {
			errorsObject.username = "Username is required";
		} else if (username.length < 4) {
			errorsObject.username = "Username must be at least 4 characters";
		}

		if (!password) {
			errorsObject.password = "Password is required";
		} else if (password.length < 6) {
			errorsObject.password = "Password must be at least 6 characters";
		}

		if (!confirmPassword) {
			errorsObject.confirmPassword = "Please confirm your password";
		} else if (password !== confirmPassword) {
			errorsObject.confirmPassword = "Passwords do not match";
		}
		setValidationObject(errorsObject);

		if (Object.keys(errorsObject).length > 0) {
			return;
		}
		const data = await dispatch(signUp(username, email, password));
		if (data) {
			setValidationObject(data);
		} else {
			closeModal();
		}
	};

	return (
		<div className="signup-form-modal-container">
			<h1>Sign up for ƒorteƒy!</h1>
			<form onSubmit={handleSubmit} className="signup-form">
				<ul id='signup-errors'>
					{Object.values(validationObject).map((error, idx) => (
						<li key={idx}>{error}</li>
					))}
				</ul>
				<label>
					Email
					{validationObject.email && <span className="signup-error">{validationObject.email}</span>}
					<input
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
					/>
				</label>
				<label>
					Username
					{validationObject.username && <span className="signup-error">{validationObject.username}</span>}
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Username"
					/>
				</label>
				<label>
					Password
					{validationObject.password && <span className="signup-error">{validationObject.password}</span>}
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
					/>
				</label>
				<label>
					Confirm Password
					{validationObject.confirmPassword && (
						<span className="signup-error">{validationObject.confirmPassword}</span>
					)}
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm Password"
					/>
				</label>
				<button className="signup-button" type="submit">Sign Up</button>
			</form>
		</div>
	);
}

export default SignupFormModal;
