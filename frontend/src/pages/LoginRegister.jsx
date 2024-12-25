import React, { useState } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegisterClick = () => setIsActive(true);

  const handleLoginClick = () => setIsActive(false);

  const handleToggleChange = () => setIsPartner(!isPartner);

  const login = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        navigate("/home");
      } else {
        const errorData = await response.json();
        toast.error(
          `Error al iniciar sesión: ${errorData.error || "Credenciales inválidas."}`
        );
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      toast.error("Error al iniciar sesión. Por favor intenta nuevamente.");
    }
  };

  const signup = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          is_partner: isPartner,
        }),
      });

      if (response.ok) {
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsActive(false);
      } else {
        const errorData = await response.json();
        toast.error(`Error al registrarse: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error("Error al registrarse", err);
      toast.error("Error al registrarse. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="signup-body">
      <div
        className={`signup-container ${isActive ? "signup-active" : ""}`}
        id="container"
      >
        <div className="signup-form-container signup-sign-up">
          <div className="form">
            <h1 className="centered-title">Create Account</h1>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username" // Añadido el atributo autocomplete
            />
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email" // Añadido el atributo autocomplete
            />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password" // Añadido el atributo autocomplete
            />
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password" // Añadido el atributo autocomplete
            />
            <div className="signup-toggle-wrapper">
              <button onClick={signup}>Sign Up</button>
              <div className="toggle-container">
                <label className="switch" htmlFor="partner-toggle">
                  <input
                    id="partner-toggle"
                    type="checkbox"
                    checked={isPartner}
                    onChange={handleToggleChange}
                    aria-labelledby="partner-label"
                  />
                  <span className="slider round"></span>
                </label>
                <span id="partner-label" className="toggle-text">
                  {isPartner ? "Staff" : "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="signup-form-container signup-sign-in">
          <div className="form">
            <h1>Log in</h1>
            <span>Use your email and password</span>
            <label htmlFor="loginUsername" className="sr-only">Username</label>
            <input
              type="text"
              id="loginUsername"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
            />
            <label htmlFor="loginPassword" className="sr-only">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button onClick={() => toast.info("Función no implementada.")}>
              Forgot your password?
            </button>
            <button onClick={login}>Log in</button>
          </div>
        </div>
        <div className="signup-toggle-container">
          <div className="signup-toggle">
            <div className="signup-toggle-panel signup-toggle-left">
              <h1>Welcome back!</h1>
              <p>Please enter your details to log in</p>
              <button
                className="signup-hidden"
                id="login"
                onClick={handleLoginClick}
              >
                Log in
              </button>
            </div>
            <div className="signup-toggle-panel signup-toggle-right">
              <h1>Hi, friend!</h1>
              <p>Register with your personal data</p>
              <button
                className="signup-hidden"
                id="register"
                onClick={handleRegisterClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
