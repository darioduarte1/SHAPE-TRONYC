import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import "../styles/Security.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Security = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      passwordMismatch: "New passwords do not match.",
      passwordSameAsCurrent: "New password must be different from the current password.",
      passwordSuccess: "Password updated successfully.",
      passwordError: "An error occurred while updating the password.",
      currentPasswordError: "Current password is incorrect.",
      languageSuccess: "Language updated successfully.",
      languageError: "Error updating language in backend.",
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
      passwordMismatch: "Las nuevas contraseñas no coinciden.",
      passwordSameAsCurrent: "La nueva contraseña debe ser diferente de la actual.",
      passwordSuccess: "Contraseña actualizada con éxito.",
      passwordError: "Ocurrió un error al actualizar la contraseña.",
      currentPasswordError: "La contraseña actual es incorrecta.",
      languageSuccess: "Idioma actualizado con éxito.",
      languageError: "Error al actualizar el idioma en el backend.",
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
      passwordMismatch: "As novas palavras-passe não coincidem.",
      passwordSameAsCurrent: "A nova palavra-passe deve ser diferente da atual.",
      passwordSuccess: "Palavra-passe atualizada com sucesso.",
      passwordError: "Ocorreu um erro ao atualizar a palavra-passe.",
      currentPasswordError: "A palavra-passe atual está incorreta.",
      languageSuccess: "Idioma atualizado com sucesso.",
      languageError: "Erro ao atualizar o idioma no backend.",
    },
  };

  const t = translations[selectedLanguage];

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleLanguageChange = async (lang) => {
    try {
      setSelectedLanguage(lang);
      localStorage.setItem("language", lang);

      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${localStorage.getItem("user_id")}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({ language: lang }),
        }
      );

      if (!response.ok) {
        toast.error(t.languageError);
      } else {
        toast.success(t.languageSuccess);
      }

      window.location.reload();
    } catch (error) {
      toast.error(t.languageError);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error(t.passwordSameAsCurrent);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(t.passwordSuccess);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        if (data.error === "Current password is incorrect.") {
          toast.error(t.currentPasswordError);
        } else {
          toast.error(data.error || t.passwordError);
        }
      }
    } catch (error) {
      toast.error(t.passwordError);
    }
  };

  return (
    <>
      <Header />
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
                <form onSubmit={handlePasswordChange}>
                  <input
                    type="password"
                    placeholder={t.currentPassword}
                    className="security-input"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder={t.newPassword}
                    className="security-input"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder={t.confirmPassword}
                    className="security-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
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
        <ToastContainer />
      </div>
    </>
  );
};

export default Security;
