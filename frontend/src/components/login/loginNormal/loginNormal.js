/**********************************************************************************************************************************
********************************************************** LOGIN ******************************************************************
**********************************************************************************************************************************/

import { toast } from "react-toastify"; // Para mostrar notificaciones
import translations from "../../../utils/translations"; // Importar traducciones

const loginNormal = async (formData, setPopupMessage, setShowPopup, navigate, language, API_BASE_URL) => {
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

export default loginNormal;