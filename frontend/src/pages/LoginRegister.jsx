import React, { useState, useEffect } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL;


const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [language, setLanguage] = useState("en");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  /**********************************************************************************************************************************
  ****************************************************** TRADUCOES ******************************************************************
  **********************************************************************************************************************************/
  const translations = {
    en: {
      googleRegister: "Sign Up\nwith Google",
      googleLogin: "Log In\nwith Google",
      emailVerificationPending:
        "Your account has not been verified. Please check your inbox and spam folder! Activate the link sent!",
      accountCreated: "Account created successfully. Please check your email to verify your account.",
      passwordsMismatch: "Passwords do not match.",
      invalidCredentials: "Invalid credentials.",
      resendVerificationEmail: "Resend email",
      errorOccured: "An error occurred. Please try again.",
      createAccount: "Create Account",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      signUp: "Sign Up",
      logIn: "Log\nIn",
      welcomeBack: "Welcome back!",
      enterLanguage: "Please select a language",
      enterDetails: "Please enter\nyour details to\nlog in",
      hiFriend: "Hi,\nfriend!",
      registerData: "Register with your personal data",
      forgotPassword: "Forgot your password?",
    },
    es: {
      googleRegister: "Regístrate\ncon Google",
      googleLogin: "Inicia sesión\ncon Google",
      emailVerificationPending:
        "Tu cuenta no ha sido verificada. Por favor revisa tu bandeja de entrada y spam! Activa el enlace enviado!",
      accountCreated: "Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.",
      passwordsMismatch: "Las contraseñas no coinciden.",
      invalidCredentials: "Credenciales inválidas.",
      resendVerificationEmail: "Reenviar correo",
      errorOccured: "Ocurrió un error. Por favor intenta nuevamente.",
      createAccount: "Crear Cuenta",
      username: "Usuario",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      signUp: "Registrarse",
      logIn: "Iniciar Sesión",
      welcomeBack: "¡Bienvenido de nuevo!",
      enterLanguage: "Por favor, selecciona un idioma",
      enterDetails: "Por favor, introduce tus datos para\niniciar sesión",
      hiFriend: "¡Hola, amigo!",
      registerData: "Regístrate con tus datos personales",
      forgotPassword: "¿Olvidaste tu contraseña?",
    },
    pt: {
      googleRegister: "Regista-te\ncom Google",
      googleLogin: "Inicia sessão\ncom Google",
      emailVerificationPending:
        "A sua conta ainda não foi verificada. Por favor verifique a caixa de entrada e o spam! Active o link enviado!",
      accountCreated: "Conta criada com sucesso. Verifique seu e-mail para ativar sua conta.",
      passwordsMismatch: "As senhas não coincidem.",
      invalidCredentials: "Credenciais inválidas.",
      resendVerificationEmail: "Reenviar email",
      errorOccured: "Ocorreu um erro. Por favor, tente novamente.",
      createAccount: "Criar Conta",
      username: "Utilizador",
      email: "Email",
      password: "Palavra-passe",
      confirmPassword: "Confirmar Palavra-passe",
      signUp: "Registar-se",
      logIn: "Iniciar Sessão",
      welcomeBack: "Bem-vindo de volta!",
      enterLanguage: "Por favor, escolha um idioma",
      enterDetails: "Por favor, insira os seus dados para\niniciar sessão",
      hiFriend: "Olá, amigo!",
      registerData: "Registe-se com os seus dados pessoais",
      forgotPassword: "Esqueceu-se da sua palavra-passe?",
    },
  };

  const t = translations[language];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      toast.success("Google login successful!");
      navigate("/home");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleRegisterClick = () => setIsActive(true);

  const handleLoginClick = () => setIsActive(false);

  const handleToggleChange = () => setIsPartner(!isPartner);


  /********************************************************************************************************************************
  ******************************************************** SIGN UP ****************************************************************
  ********************************************************************************************************************************/
  const signup = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error(t.errorOccured);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t.passwordsMismatch);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": language, // Pasar el idioma seleccionado
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          language, // Asegúrate de que este valor se envíe
        }),
      });

      if (response.ok) {
        toast.success(t.accountCreated, { autoClose: 10000 }); // Duración ajustada a 10 segundos
        setIsActive(false);
      } else {
        const errorData = await response.json();
        // Mostrar mensajes específicos de errores
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            messages.forEach((msg) => toast.error(msg));
          });
        } else {
          toast.error(t.errorOccured);
        }
      }
    } catch (error) {
      console.error("Registration error", error);
      toast.error(t.errorOccured);
    }
  };

  /**********************************************************************************************************************************
  ******************************************* COOLDOWN DEL BUTTON DE REENVIAR EMAIL *************************************************
  **********************************************************************************************************************************/
  // Estado inicial para manejar cooldown
  const [resendCooldown, setResendCooldown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup
  const [popupMessage, setPopupMessage] = useState(""); // Contiene el mensaje del popup

  // Función para manejar cooldown
  const startCooldown = (duration) => {
    setResendCooldown(true); // Activar cooldown
    setSecondsLeft(duration); // Configurar duración inicial del temporizador

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval); // Detener el temporizador
          setResendCooldown(false); // Desactivar cooldown
          return 0; // Reiniciar segundos restantes
        }
        return prev - 1; // Decrementar contador
      });
    }, 1000);
  };

  /**********************************************************************************************************************************
  *********************************************** REENVIO DE EMAIL CONFIRMACION *****************************************************
  **********************************************************************************************************************************/
  const resendVerificationEmail = async (username) => {
    if (!username) {
      console.warn("El username no puede estar vacío.");
      toast.error("El username no puede estar vacío.");
      return; // Detén la ejecución si el username es nulo o vacío
    }

    if (resendCooldown) {
      console.warn("Intento bloqueado: cooldown activo.");
      return; // Bloquear nuevas solicitudes si el cooldown está activo
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        toast.success("Email de verificação reenviado com sucesso.");
        startCooldown(60); // Activar cooldown por 60 segundos
      } else if (response.status === 429) {
        toast.error("Demasiados intentos. Por favor, espera un momento.");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al reenviar el correo. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al reenviar el correo:", error);
      toast.error("Ocurrió un error. Inténtalo nuevamente.");
    }
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
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        if (data.user_id) localStorage.setItem("user_id", data.user_id);
        navigate("/home");
      } else if (response.status === 403) {
        console.error("Usuario inactivo:", data);
        const userLanguage = data.language || "en";
        setPopupMessage(
          translations[userLanguage]?.emailVerificationPending ||
          "Sua conta não foi verificada! Por favor, verifique seu email."
        );
        setShowPopup(true);
      } else {
        console.error("Credenciales inválidas:", data);
        toast.error(data.error || translations[language]?.invalidCredentials || "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Error en el login:", error);
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
            ? translations.googleRegister
            // Texto para login
            : translations.googleLogin}
        </span>
      </button>
    );
  };

  /**********************************************************************************************************************************
  *************************************************** REGISTRO CON GOOGLE ***********************************************************
  **********************************************************************************************************************************/
  const googleRegister = () => {
    const googleRegisterUrl = "https://127.0.0.1:8000/auth/oauth2/login/google/";
    window.location.href = googleRegisterUrl;
  };

  /**********************************************************************************************************************************
  ***************************************************** LOGIN CON GOOGLE ************************************************************
  **********************************************************************************************************************************/
  const googleLogin = () => {
    const googleLoginUrl = "https://127.0.0.1:8000/auth/oauth2/login/google/";
    window.location.href = googleLoginUrl;
  };

  /**********************************************************************************************************************************
  *********************************************************** HTML ******************************************************************
  **********************************************************************************************************************************/
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
              <button id="signUpButton" onClick={signup}>{t.signUp}</button>
              <GoogleAuthButton mode="signup" onClick={googleRegister} translations={t} />
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
                      id={resendCooldown ? "button-disabled" : "button-enabled"} // Atributo id dinámico
                      onClick={() => resendVerificationEmail(formData.username)} // Usa el username en lugar del email
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
                      {resendCooldown
                        ? `Reenviar email (${secondsLeft}s)` // Mostrar temporizador si está activo
                        : t.resendVerificationEmail}
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
