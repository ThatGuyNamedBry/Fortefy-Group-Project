import React, { useState } from "react";
import { login } from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import SignupFormModal from "../SignupFormModal";
import OAuthButtons from "../OAuthButtons";
import "./LoginForm.css";

function LoginFormModal({ errors: initialErrors = {} }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(initialErrors);
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
    <div className="login-modal-container login-modal">
      <h1 className="Log-in-text">Log in to ƒorteƒy</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="auth-alt-methods">
          <button className="demoUserLink" onClick={demoUserLogin}>Continue with Demo User</button>
          <OAuthButtons label="Continue with Google" />
        </div>
            <ul className="errors-ul">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </label>
        <button className = 'login-button' type="submit">Log In</button>
      </form>
      <p className="sign-up-link">
        Don't have an account?{" "}
        <a href="" onClick={openSignupModal}>Sign up for ƒorteƒy</a>
      </p>
    </div>
  );
}

export default LoginFormModal;
