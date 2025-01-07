import React, { useState, useEffect, useRef } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import translations from "../utils/translations";
import signupNormal from "../components/signup/signupNormal/signupNormal";
import useCooldown from "../components/signup/signupNormal/utils/cooldown"; // Timer de cooldown para o botao de reenviar email de verificação 
import resendVerificationEmail from "../components/signup/signupNormal/utils/resendVerificationEmail"; // Función para reenviar email de verificação
import loginNormal from "../components/login/loginNormal/loginNormal"; // Función para hacer login de forma normal

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
  const [formData, setFormData] = useState({username: "", email: "", password: "", confirmPassword: ""});
  const navigate = useNavigate();


/**********************************************************************************************************************************
*************************** MUESTRA MENSAGES BASADOS EN LA URL + LIMPIA URL DESPUES DE MOSTRAR EL MENSAGE *************************
**********************************************************************************************************************************/
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  const messageKey = urlParams.get("message");
  const userLanguage = localStorage.getItem("language") || "en";

  if (messageKey) {
    const message = translations[userLanguage]?.[messageKey] || "An unknown error occurred.";

    if (status === "success") {
      toast.success(message);
    } else if (status === "error") {
      toast.error(message);
    }

    // Limpia la URL eliminando los parámetros después de mostrar el mensaje
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

/**********************************************************************************************************************************
************************************** CONFIGURA EL IDIOMA SI NO ESTA DEFINIDO EN LOCAL STORAGE ***********************************
**********************************************************************************************************************************/
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


/**********************************************************************************************************************************
******************************* MUESTRA MENSAGES EXITOSOS CUANDO EL BACKEND ACTIVA SHOW TOASTER ***********************************
**********************************************************************************************************************************/
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

/**********************************************************************************************************************************
******************************* ESCUCHA CAMBIOS EN LOCAL STORE PARA POSSIBLES SINCRONIZACIONES ************************************
**********************************************************************************************************************************/
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed:", localStorage.getItem("show_toaster"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

/**********************************************************************************************************************************
*************************** MUESTRA MENSAGES BASADOS EN LA URL + LIMPIA URL DESPUES DE MOSTRAR EL MENSAGE *************************
**********************************************************************************************************************************/
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const messageKey = urlParams.get("message");
    const userLanguage = localStorage.getItem("language") || "en";

    if (messageKey) {
        const message = translations[userLanguage]?.[messageKey] || "An unknown error occurred.";
        
        if (status === "success") {
            toast.success(message);
        } else if (status === "error") {
            toast.error(message);
        }
        
        // Limpia la URL eliminando los parámetros después de mostrar el mensaje
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}, []);


/**********************************************************************************************************************************
**************************************************** MANEJO DEL SLIDER ************************************************************
**********************************************************************************************************************************/
  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick = () => setIsActive(false);

/**********************************************************************************************************************************
************************************************* ACTUALIZACION DE LENGUAGE *******************************************************
**********************************************************************************************************************************/
  const handleLanguageChange = (lang) => {
    setLanguage(lang); // Actualiza el estado del componente
    localStorage.setItem("language", lang); // Actualiza el idioma en localStorage
    console.log(`Language updated to: ${lang} and saved to localStorage.`);
  };

/**********************************************************************************************************************************
****************************************************** SIGNUP NORMAL **************************************************************
**********************************************************************************************************************************/
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

/**********************************************************************************************************************************
************************************************* MANEJO DEL TOGGLE SWITCH ********************************************************
**********************************************************************************************************************************/
  const handleToggleChange = () => setIsPartner(!isPartner);

/**********************************************************************************************************************************
*********************************************** REENVIO DE EMAIL CONFIRMACION *****************************************************
**********************************************************************************************************************************/
  const handleResendVerification = () => {
    resendVerificationEmail(formData.username, startCooldown, resendCooldown);
  };

/**********************************************************************************************************************************
****************************************************** LOGIN NORMAL ***************************************************************
**********************************************************************************************************************************/
  const handleLogin = () => {
    loginNormal(formData, setPopupMessage, setShowPopup, navigate, language, API_BASE_URL);
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
const handleGoogleSignup = () => {
  const language = localStorage.getItem("language") || "en"; // Obtener el lenguaje desde localStorage
  const googleSignupUrl = `${API_BASE_URL}/auth/oauth2/signup/google/?language=${language}`;
  console.log("Redirigiendo a:", googleSignupUrl);
  window.location.href = googleSignupUrl; // Redirige al backend con el lenguaje
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
              <GoogleAuthButton mode="signup" onClick={handleGoogleSignup} translations={t} />
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
            <button id="logInButton" onClick={handleLogin}>{t.logIn}</button>
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
