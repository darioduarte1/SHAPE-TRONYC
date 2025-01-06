import { toast } from "react-toastify";

const signupNormal = async (formData, setIsActive, language, t, API_BASE_URL) => {
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

export default signupNormal;