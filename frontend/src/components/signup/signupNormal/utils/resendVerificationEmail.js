import { toast } from "react-toastify";

// Importar startCooldown del archivo cooldown.js
import useCooldown from "./cooldown";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Función para reenviar email de verificación
const resendVerificationEmail = async (username, startCooldown, resendCooldown) => {
  if (!username) {
    toast.error("El username no puede estar vacío.");
    return;
  }

  if (resendCooldown) {
    toast.warning("Intento bloqueado: cooldown activo.");
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

export default resendVerificationEmail;