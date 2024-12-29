import React, { useState } from "react";
import "../styles/Security.css";

const Security = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const translations = {
    en: {
      pageTitle: "Security Configuration",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      changeEmail: "Change Email",
      newEmail: "New Email",
      changeLanguage: "Change Language",
    },
    es: {
      pageTitle: "Configuración de Seguridad",
      changePassword: "Cambiar Contraseña",
      currentPassword: "Contraseña Actual",
      newPassword: "Nueva Contraseña",
      confirmPassword: "Confirmar Contraseña",
      changeEmail: "Cambiar Correo Electrónico",
      newEmail: "Nuevo Correo Electrónico",
      changeLanguage: "Cambiar Idioma",
    },
    pt: {
      pageTitle: "Configuração de Segurança",
      changePassword: "Alterar Palavra-passe",
      currentPassword: "Palavra-passe Atual",
      newPassword: "Nova Palavra-passe",
      confirmPassword: "Confirmar Palavra-passe",
      changeEmail: "Alterar Email",
      newEmail: "Novo Email",
      changeLanguage: "Alterar Idioma",
    },
  };

  const t = translations[selectedLanguage];

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);
    window.location.reload(); // Refresca la página para aplicar el nuevo idioma
  };

  return (
    <div className="security-container">
      <h1 className="security-title">{t.pageTitle}</h1>
      <div className="accordion">
        {/* Change Password */}
        <div className="accordion-item">
          <button
            className="accordion-button"
            onClick={() => toggleSection("password")}
          >
            {t.changePassword}
          </button>
          {activeSection === "password" && (
            <div className="accordion-content">
              <form>
                <input
                  type="password"
                  placeholder={t.currentPassword}
                  className="security-input"
                />
                <input
                  type="password"
                  placeholder={t.newPassword}
                  className="security-input"
                />
                <input
                  type="password"
                  placeholder={t.confirmPassword}
                  className="security-input"
                />
                <button type="submit" className="security-submit-button">
                  {t.changePassword}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Change Email */}
        <div className="accordion-item">
          <button
            className="accordion-button"
            onClick={() => toggleSection("email")}
          >
            {t.changeEmail}
          </button>
          {activeSection === "email" && (
            <div className="accordion-content">
              <form>
                <input
                  type="email"
                  placeholder={t.newEmail}
                  className="security-input"
                />
                <button type="submit" className="security-submit-button">
                  {t.changeEmail}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Change Language */}
        <div className="accordion-item">
          <button
            className="accordion-button"
            onClick={() => toggleSection("language")}
          >
            {t.changeLanguage}
          </button>
          {activeSection === "language" && (
            <div className="accordion-content">
              <div className="language-options">
                <button
                  className={`language-button ${
                    selectedLanguage === "en" ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange("en")}
                >
                  <img
                    src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/English.png"
                    alt="English"
                  />
                </button>
                <button
                  className={`language-button ${
                    selectedLanguage === "es" ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange("es")}
                >
                  <img
                    src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/Spanish.png"
                    alt="Español"
                  />
                </button>
                <button
                  className={`language-button ${
                    selectedLanguage === "pt" ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange("pt")}
                >
                  <img
                    src="https://res.cloudinary.com/deizebh0z/image/upload/v1735434595/pictures_backend/flags_register/Portuguese.png"
                    alt="Português"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Security;















