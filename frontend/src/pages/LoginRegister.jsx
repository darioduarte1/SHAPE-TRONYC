import React, { useState, useEffect, useMemo, useRef } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import translations from "../utils/translations";
import signupNormal from "../components/signup/signupNormal/signupNormal";
import useCooldown from "../components/signup/signupNormal/utils/cooldown"; // Timer de cooldown para o botao de reenviar email de verificação 
import resendVerificationEmail from "../components/signup/signupNormal/utils/resendVerificationEmail"; // Función para reenviar email de verificação

const API_BASE_URL = process.env.REACT_APP_API_URL;

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const toasterShown = useRef(false);
  const t = translations[language];
  const { resendCooldown, secondsLeft, startCooldown } = useCooldown();
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup
  const [popupMessage, setPopupMessage] = useState(""); // Contiene el mensaje del popup
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();



  useEffect(() => {
    // Verificar si ya existe un idioma en localStorage
    const storedLanguage = localStorage.getItem("language");

    if (!storedLanguage) {
      // Si no existe, establece el idioma predeterminado (inglés)
      localStorage.setItem("language", "en");
      console.log("No language found in localStorage. Setting default to 'en'.");
      setLanguage("en"); // Actualiza el estado del componente al idioma predeterminado
    } else {
      // Si existe un idioma, sincroniza el estado con el valor en localStorage
      setLanguage(storedLanguage);
      console.log("Language found in localStorage:", storedLanguage);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userId = params.get("user_id");
    const userLanguage = params.get("language"); // Obtener el idioma desde los parámetros

    if (accessToken && refreshToken && userId && userLanguage) {
      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("language", userLanguage); // Almacenar el idioma en localStorage
      console.log("Language received from backend:", userLanguage);
      localStorage.setItem("show_toaster", "true");

      window.history.replaceState({}, document.title, "/auth");
    } else {
      const storedAccessToken = localStorage.getItem("access");
      const storedRefreshToken = localStorage.getItem("refresh");

      if (!storedAccessToken || !storedRefreshToken) {
        navigate("/auth");
      }
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const userLanguage = localStorage.getItem("language") || "en";

    // Agrega un log para confirmar el idioma del toaster
    console.log("Toaster language:", userLanguage);

    if (!toasterShown.current && localStorage.getItem("show_toaster") === "true") {
      toasterShown.current = true; // Marca el toaster como mostrado
      console.log("Displaying toaster...");

      setTimeout(() => {
        toast.success(
          translations[userLanguage]?.accountCreatedSuccess || t.accountCreatedSuccess,
          { autoClose: 10000 }
        );
        localStorage.removeItem("show_toaster");
        console.log("Toaster displayed and flag removed");
      }, 1000);
    }
  }, [t]);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed:", localStorage.getItem("show_toaster"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang); // Actualiza el estado del componente
    localStorage.setItem("language", lang); // Actualiza el idioma en localStorage
    console.log(`Language updated to: ${lang} and saved to localStorage.`);
  };

  const handleRegisterClick = () => setIsActive(true);

  const handleLoginClick = () => setIsActive(false);

  const handleToggleChange = () => setIsPartner(!isPartner);


  /**********************************************************************************************************************************
  *********************************************** REENVIO DE EMAIL CONFIRMACION *****************************************************
  **********************************************************************************************************************************/
  const handleResendVerification = () => {
    resendVerificationEmail(formData.username, startCooldown, resendCooldown);
  };

  /**********************************************************************************************************************************
  ********************************************************** LOGIN ******************************************************************
  **********************************************************************************************************************************/
  const login = async () => {
    console.log("Datos enviados para login:", formData);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login exitoso:", data);

        // Guardar tokens en localStorage
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Guardar el idioma del usuario en localStorage desde la base de datos
        if (data.language) {
          localStorage.setItem("language", data.language);
          console.log("Idioma guardado en localStorage:", data.language);
        } else {
          // Si no hay un idioma en la base de datos, guardar inglés por defecto
          localStorage.setItem("language", "en");
          console.warn("Idioma no especificado, configurado a inglés por defecto.");
        }

        // Guardar el user_id si está disponible
        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        }

        // Redirigir al home
        navigate("/home");
      } else if (response.status === 403) {
        console.error("Usuario inactivo:", data);

        const userLanguage = data.language || "en"; // Usar idioma si está disponible o inglés por defecto

        setPopupMessage(
          translations[userLanguage]?.emailVerificationPending ||
          "Sua conta não foi verificada! Por favor, verifique seu email."
        );
        setShowPopup(true);
      } else {
        console.error("Credenciales inválidas:", data);

        // Mostrar error basado en idioma seleccionado
        toast.error(data.error || translations[language]?.invalidCredentials || "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Error en el login:", error);

      // Mostrar error genérico basado en idioma seleccionado
      toast.error(translations[language]?.errorOccured || "Ocorreu um erro.");
    }
  };




  /**********************************************************************************************************************************
  *************************************************** BOTAO GOOGLE REUTILIZAVEL *****************************************************
  **********************************************************************************************************************************/
  // Componente reutilizable para los botones de Google
  const GoogleAuthButton = ({ mode, onClick, translations }) => {
    return (
      <button id="googleLoginButton" className="google-login-button" onClick={onClick}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google Logo"
          className="google-logo"
        />
        <span className="google-login-text">
          {mode === "signup"
            // Texto para registro
            ? translations.googleSignup
            // Texto para login
            : translations.googleLogin}
        </span>
      </button>
    );
  };

  /**********************************************************************************************************************************
  *************************************************** REGISTRO CON GOOGLE ***********************************************************
  **********************************************************************************************************************************/
  const googleSignup = () => {
    const apiUrl = API_BASE_URL || "https://127.0.0.1:8000"; // Base URL del backend
    const selectedLanguage = language || "en"; // Lenguaje seleccionado o predeterminado
    const googleSignupUrl = `${apiUrl}/auth/oauth2/signup/google/?language=${selectedLanguage}`;
    console.log("Generated Google Signup URL:", googleSignupUrl);
    window.location.href = googleSignupUrl; // Redirigir al backend
  };

  /**********************************************************************************************************************************
  ***************************************************** LOGIN CON GOOGLE ************************************************************
  **********************************************************************************************************************************/
  const googleLogin = () => {
    const googleLoginUrl = `${API_BASE_URL}/auth/oauth2/login/google/`;
    window.location.href = googleLoginUrl;
  };

  /**********************************************************************************************************************************
  *********************************************************** HTML ******************************************************************
  **********************************************************************************************************************************/
  if (loading) {
    return <div className="spinner">Cargando...</div>;
  }

  return (
    <div className="signup-body">
      <div className={`signup-container ${isActive ? "signup-active" : ""}`} id="container">
        <div className="signup-form-container signup-sign-up">
          <div className="form">
            <h1 className="centered-title">{t.createAccount}</h1>
            <input
              type="text"
              name="username"
              id="formRegisterUsername"
              placeholder={t.username}
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
            />
            <input
              type="email"
              name="email"
              id="formRegisterEmail"
              placeholder={t.email}
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              id="formRegisterPassword"
              placeholder={t.password}
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            <input
              type="password"
              name="confirmPassword"
              id="formRegisterConfirmPassword"
              placeholder={t.confirmPassword}
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
              <button
                id="signUpButton"
                onClick={() => signupNormal(formData, setIsActive, language, t, API_BASE_URL)}
              >
                {t.signUp}
              </button>
              <GoogleAuthButton mode="signup" onClick={googleSignup} translations={t} />
            </div>
          </div>
        </div>
        <div className="signup-form-container signup-sign-in">
          <div id="formLogin" className="form">
            <h1 id="login-title">{t.logIn}</h1>
            <input
              type="text"
              name="username"
              id="formRegisterUsername"
              placeholder={t.username}
              value={formData.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              id="formRegisterPassword"
              placeholder={t.password}
              value={formData.password}
              onChange={handleInputChange}
            />
            <button id="logInButton" onClick={login}>{t.logIn}</button>
            <GoogleAuthButton mode="login" onClick={googleLogin} translations={t} />
            <button
              onClick={() => toast.info("Función no implementada.")}
              className="forgot-password-button"
            >
              {language === "pt" ? (
                <>
                  <span>Esqueceu-se da</span>
                  <span>sua palavra-passe?</span>
                </>
              ) : language === "en" ? (
                <>
                  <span>Forgot your</span>
                  <span>password?</span>
                </>
              ) : (
                <>
                  <span>{t.forgotPassword.split(" ")[0]}</span>
                  <span>{t.forgotPassword.split(" ").slice(1).join(" ")}</span>
                </>
              )}
            </button>
            {showPopup && (
              <div className="popup-overlay">
                <div className="popup">
                  <p id="popupMessage">{popupMessage}</p>
                  <div className="button-container">
                    <button
                      onClick={handleResendVerification} // Reemplaza aquí
                      disabled={resendCooldown}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: resendCooldown ? "gray" : "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: resendCooldown ? "not-allowed" : "pointer",
                      }}
                    >
                      {resendCooldown ? `Reenviar email (${secondsLeft}s)` : t.resendVerificationEmail}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="signup-toggle-container">
          <div className="signup-toggle">
            <div className="signup-toggle-panel signup-toggle-left">
              <h1>{t.welcomeBack}</h1>
              <p id="enterLanguage" >{t.enterLanguage}</p>
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
              <p id="register">{t.registerData}</p>
              <button id="login" onClick={handleLoginClick}>
                {t.logIn}
              </button>
            </div>
            <div className="signup-toggle-panel signup-toggle-right">
              <h1>{t.hiFriend}</h1>
              <p id="enterLanguage" >{t.enterLanguage}</p>
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
              <p id="enterDetails">{t.enterDetails}</p>
              <button id="register" onClick={handleRegisterClick}>
                {t.signUp}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
