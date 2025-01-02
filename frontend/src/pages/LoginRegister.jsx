import React, { useState, useEffect } from "react";
import "../styles/LoginRegister.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

  const translations = {
    en: {
      googleRegister: "Sign Up\nwith Google",
      googleLogin: "Log In\nwith Google",
      emailVerificationPending:
        "Your account is not yet verified. Check your email for the confirmation link. A new email has been sent.",
      accountCreated: "Account created successfully. Please check your email to verify your account.",
      passwordsMismatch: "Passwords do not match.",
      invalidCredentials: "Invalid credentials.",
      resendVerificationEmail: "Verification email resent successfully.",
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
        "Tu cuenta no está verificada. Revisa tu correo electrónico para el enlace de confirmación. Se ha enviado un nuevo correo.",
      accountCreated: "Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.",
      passwordsMismatch: "Las contraseñas no coinciden.",
      invalidCredentials: "Credenciales inválidas.",
      resendVerificationEmail: "Correo de verificación reenviado exitosamente.",
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
        "Sua conta ainda não foi verificada. Verifique seu e-mail para o link de confirmação. Um novo e-mail foi enviado.",
      accountCreated: "Conta criada com sucesso. Verifique seu e-mail para ativar sua conta.",
      passwordsMismatch: "As senhas não coincidem.",
      invalidCredentials: "Credenciais inválidas.",
      resendVerificationEmail: "E-mail de verificação reenviado com sucesso.",
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

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        }
        if (data.language) {
          localStorage.setItem("language", data.language);
        }
        navigate("/home");
      } else if (data.error === "Email not verified") {
        toast.warning(t.emailVerificationPending);
      } else {
        toast.error(t.invalidCredentials);
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error(t.errorOccured);
    }
  };

  // const resendVerificationEmail = async (email) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     if (response.ok) {
  //       toast.success(t.resendVerificationEmail);
  //     } else {
  //       toast.error(t.errorOccured);
  //     }
  //   } catch (error) {
  //     console.error("Resend verification error", error);
  //     toast.error(t.errorOccured);
  //   }
  // };

  const googleRegister = () => {
    const googleRegisterUrl = "https://127.0.0.1:8000/auth/oauth2/login/google/";
    window.location.href = googleRegisterUrl;
  };

  const googleLogin = () => {
    const googleLoginUrl = "https://127.0.0.1:8000/auth/oauth2/login/google/";
    window.location.href = googleLoginUrl;
  };

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
          <div className="form">
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
