import React, { useState } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

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

    const login = async (email, password) => {
        try {
            const response = await fetch("http://localhost:8000/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                toast.success("Inicio de sesión exitoso. ¡Bienvenido!");
                navigate("/home");
            } else {
                const errorData = await response.json();
                toast.error("Error al iniciar sesión: " + errorData.error || "Credenciales incorrectas.");
            }
        } catch (err) {
            console.error("Error al iniciar sesión", err);
            toast.error("Error al iniciar sesión. Por favor, intenta nuevamente.");
        }
    };

    const signup = async (username, email, password, confirmPassword, isPartner) => {
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8000/auth/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password, confirm_password: confirmPassword, is_partner: isPartner }),
            });
    
            if (response.ok) {
                toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
                setIsActive(false); // Cambiar a la vista de login
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
                        <h1>Crear Cuenta</h1>
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
                                onClick={() => signup(username, email, password, confirmPassword, isPartner)}
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
                                {isPartner ? "Socio" : "Usuario"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="signup-form-container signup-sign-in">
                    <div className="form">
                        <h1>Iniciar Sesión</h1>
                        <span>Usa tu correo y contraseña</span>
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
                        <button onClick={() => toast.info("Función no implementada.")}>¿Olvidaste tu contraseña?</button>
                        <button onClick={() => login(email, password)}>Iniciar Sesión</button>
                    </div>
                </div>
                <div className="signup-toggle-container">
                    <div className="signup-toggle">
                        <div className="signup-toggle-panel signup-toggle-left">
                            <h1>¡Bienvenido de nuevo!</h1>
                            <p>Introduce tus datos para iniciar sesión</p>
                            <button
                                className="signup-hidden"
                                id="login"
                                onClick={handleLoginClick}
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                        <div className="signup-toggle-panel signup-toggle-right">
                            <h1>¡Hola, amigo!</h1>
                            <p>Regístrate con tus datos personales</p>
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
