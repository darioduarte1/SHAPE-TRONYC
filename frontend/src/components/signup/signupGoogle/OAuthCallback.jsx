import React, { useEffect } from "react"; // Asegúrate de incluir React y useEffect
import { useNavigate, useSearchParams } from "react-router-dom"; // useNavigate y useSearchParams vienen de react-router-dom

const OAuthCallback = () => {
  const [searchParams] = useSearchParams(); // Hook para obtener parámetros de la URL
  const navigate = useNavigate(); // Hook para la navegación

  useEffect(() => {
    const storeAuthData = () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const userId = searchParams.get("user_id");
        const language = searchParams.get("language");

        if (!accessToken || !refreshToken || !userId) {
          throw new Error("Missing authentication data");
        }

        // Guardar datos en localStorage
        localStorage.setItem("access", accessToken);
        localStorage.setItem("refresh", refreshToken);
        localStorage.setItem("user_id", userId);
        localStorage.setItem("language", language || "en");

        // Redirigir a la página principal o auth
        navigate("/auth");
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/auth", { state: { error: "Authentication failed" } });
      }
    };

    storeAuthData();
  }, [searchParams, navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallback;
