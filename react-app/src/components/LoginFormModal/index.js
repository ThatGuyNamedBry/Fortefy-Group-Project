import React, { useState } from "react";
import { login } from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import SignupFormModal from "../SignupFormModal";
import OpenModalButton from "../OpenModalButton";

import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const { closeModal, setModalContent } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await dispatch(login(email, password));
    if (data) {
      setErrors(data);
    } else {
      closeModal()
    }
  };

  const demoUserLogin = async (e) => {
    e.preventDefault();
    const demoUserCredentials = {
      email: "demo@aa.io",
      password: "password"
    };
    await dispatch(login(demoUserCredentials.email, demoUserCredentials.password))
      .then(() => {
        closeModal();
        alert("Demo user logged in 😎");
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };


  const openSignupModal = (e) => {
    e.preventDefault();
    setModalContent(<SignupFormModal />);
  };

  return (
    <div className="login-modal-container">
      <h1 className="Log-in-text">Log in to ƒorteƒy</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <ul>
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <button className="demoUserLink" onClick={demoUserLogin}>Continue with Demo User</button>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Log In</button>
      </form>
      <p className="sign-up-link">
        Don't have an account?{" "}
        <a href="" onClick={openSignupModal}>Sign up for ƒorteƒy</a>
      </p>
    </div>
  );
}

export default LoginFormModal;
