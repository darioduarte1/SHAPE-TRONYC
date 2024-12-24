import React, { useState } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Determina la URL base desde las variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false); // Controla si estás en registro o login
  const [isPartner, setIsPartner] = useState(false); // Controla el toggle de "Partner"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleToggleChange = () => {
    setIsPartner(!isPartner);
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        toast.success("Inicio de sesión exitoso.");
        navigate("/home");
      } else {
        const errorData = await response.json();
        toast.error(
          "Error al iniciar sesión: " +
            (errorData.error || "Credenciales inválidas.")
        );
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      toast.error("Error al iniciar sesión. Por favor intenta nuevamente.");
    }
  };

  const signup = async (username, email, password, confirmPassword, isPartner) => {
    if (password !== confirmPassword) {
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
          username,
          email,
          password,
          confirm_password: confirmPassword,
          is_partner: isPartner,
        }),
      });

      if (response.ok) {
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsActive(false);
      } else {
        const errorData = await response.json();
        toast.error("Error al registrarse: " + JSON.stringify(errorData));
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
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="signup-toggle-wrapper">
              <button
                onClick={() =>
                  signup(username, email, password, confirmPassword, isPartner)
                }
              >
                Sign Up
              </button>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPartner}
                  onChange={handleToggleChange}
                />
                <span className="slider round"></span>
              </label>
              <span className="toggle-text">
                {isPartner ? "Staff" : "User"}
              </span>
            </div>
          </div>
        </div>
        <div className="signup-form-container signup-sign-in">
          <div className="form">
            <h1>Log in</h1>
            <span>Use your email and password</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => toast.info("Función no implementada.")}>
              Forgot your password?
            </button>
            <button onClick={() => login(username, password)}>Log in</button>
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
