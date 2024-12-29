import React, { useState } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [language, setLanguage] = useState("en"); // Idioma inicial
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const translations = {
    en: {
      createAccount: "Create Account",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Password",
      signUp: "Sign Up",
      logIn: "Log in",
      welcomeBack: "Welcome back!",
      enterLanguage: "Please select a language",
      enterDetails: "Please enter your details to log in",
      hiFriend: "Hi, friend!",
      registerData: "Register with your personal data",
      forgotPassword: "Forgot your password?",
    },
    es: {
      createAccount: "Crear Cuenta",
      username: "Usuario",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Contraseña",
      signUp: "Registrarse",
      logIn: "Iniciar Sesión",
      welcomeBack: "¡Bienvenido de nuevo!",
      enterLanguage: "Por favor, selecciona un idioma",
      enterDetails: "Por favor, introduce tus datos para iniciar sesión",
      hiFriend: "¡Hola, amigo!",
      registerData: "Regístrate con tus datos personales",
      forgotPassword: "¿Olvidaste tu contraseña?",
    },
    pt: {
      createAccount: "Criar Conta",
      username: "Utilizador",
      email: "Email",
      password: "Palavra-passe",
      confirmPassword: "Palavra-passe",
      signUp: "Registar-se",
      logIn: "Iniciar Sessão",
      welcomeBack: "Bem-vindo de volta!",
      enterLanguage: "Por favor, escolha um idioma",
      enterDetails: "Por favor, insira os seus dados para iniciar sessão",
      hiFriend: "Olá, amigo!",
      registerData: "Registe-se com os seus dados pessoais",
      forgotPassword: "Esqueceu-se da sua palavra-passe?",
    },
  };

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
        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        } else {
          console.error("El user_id no fue proporcionado por el servidor.");
          toast.error("Error al iniciar sesión: falta el user_id.");
          return;
        }
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
          language: language, // Se agrega el idioma seleccionado
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
            <h1 className="centered-title">{translations[language].createAccount}</h1>
            {/* Botones de cambio de idioma */}
            <div className="unique-language-buttons">
              <button onClick={() => handleLanguageChange("en")} aria-label="English">
                <img src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/English.png" alt="English" />
              </button>
              <button onClick={() => handleLanguageChange("es")} aria-label="Español">
                <img src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/Spanish.png" alt="Español" />
              </button>
              <button onClick={() => handleLanguageChange("pt")} aria-label="Português">
                <img src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/Portuguese.png" alt="Português" />
              </button>
            </div>
            <label htmlFor="username" className="sr-only">
              {translations[language].username}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder={translations[language].username}
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
            />
            <label htmlFor="email" className="sr-only">
              {translations[language].email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={translations[language].email}
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
            />
            <label htmlFor="password" className="sr-only">
              {translations[language].password}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder={translations[language].password}
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            <label htmlFor="confirmPassword" className="sr-only">
              {translations[language].confirmPassword}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder={translations[language].confirmPassword}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            <div className="signup-toggle-wrapper">
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
              <button onClick={signup}>{translations[language].signUp}</button>
            </div>
          </div>
        </div>

        <div className="signup-form-container signup-sign-in">
          <div className="form">
            <h1 id="login-title">{translations[language].logIn}</h1>
            <label htmlFor="loginUsername" className="sr-only">
              {translations[language].username}
            </label>
            <input
              type="text"
              id="loginUsername"
              name="username"
              placeholder={translations[language].username}
              value={formData.username}
              onChange={handleInputChange}
            />
            <label htmlFor="loginPassword" className="sr-only">
              {translations[language].password}
            </label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              placeholder={translations[language].password}
              value={formData.password}
              onChange={handleInputChange}
            />
            <button onClick={login}>{translations[language].logIn}</button>
            <button
              onClick={() => toast.info("Función no implementada.")}
              className="forgot-password-button"
            >
              <span>{translations[language].forgotPassword.split(" ")[0]}</span>
              <span>{translations[language].forgotPassword.split(" ").slice(1).join(" ")}</span>
            </button>
          </div>
        </div>

        <div className="signup-toggle-container">
          <div className="signup-toggle">
            <div className="signup-toggle-panel signup-toggle-left">
              <h1 className={language === 'pt' ? 'portuguese-title' : 'default-title'}>
                {language === 'pt' ? (
                  <>
                    <span>Bem-vindo</span>
                    <br />
                    <span>de volta</span>
                  </>
                ) : (
                  translations[language].welcomeBack
                )}
              </h1>
              <p>{translations[language].enterLanguage}</p>
              <p>{translations[language].enterDetails}</p>
              <button
                className="signup-hidden"
                id="login"
                onClick={handleLoginClick}
              >
                {translations[language].logIn}
              </button>
            </div>
            <div className="signup-toggle-panel signup-toggle-right">
              <h1>{translations[language].hiFriend}</h1>
              <p>{translations[language].registerData}</p>
              <button
                className="signup-hidden"
                id="register"
                onClick={handleRegisterClick}
              >
                {translations[language].signUp}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
