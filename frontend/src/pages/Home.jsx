import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [language, setLanguage] = useState('en'); // Idioma predeterminado
  const navigate = useNavigate();

  // Traducciones según el idioma
  const translations = {
    en: {
      welcome: "Welcome to the Home Page!",
      message: "You are successfully logged in.",
      loading: "Loading...",
    },
    es: {
      welcome: "¡Bienvenido a la página principal!",
      message: "Has iniciado sesión correctamente.",
      loading: "Cargando...",
    },
    pt: {
      welcome: "Bem-vindo à Página Principal!",
      message: "Você fez login com sucesso.",
      loading: "Carregando...",
    },
  };

  useEffect(() => {
    const manageTokens = () => {
      // Extraer tokens de la URL si están presentes
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const userLanguage = params.get('language') || 'en';

      if (accessToken && refreshToken) {
        // Guardar tokens y lenguaje en localStorage
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
        localStorage.setItem('language', userLanguage);

        // Limpiar los parámetros de la URL
        window.history.replaceState({}, document.title, '/home');
      } else {
        // Validar si los tokens ya están en localStorage
        const storedAccessToken = localStorage.getItem('access');
        const storedRefreshToken = localStorage.getItem('refresh');
        const storedLanguage = localStorage.getItem('language') || 'en';

        if (!storedAccessToken || !storedRefreshToken) {
          navigate('/login'); // Redirigir al login si no hay tokens
          return;
        }

        setLanguage(storedLanguage); // Establecer el idioma desde localStorage
      }

      setLoading(false); // Desactiva el indicador de carga
    };

    manageTokens();
  }, [navigate]);

  if (loading) {
    return <div className="spinner">{translations[language]?.loading || "Loading..."}</div>;
  }

  return (
    <div>
      <Header />
      <div className="container mt-5 pt-5">
        <h1>{translations[language]?.welcome || "Welcome to the Home Page!"}</h1>
        <p>{translations[language]?.message || "You are successfully logged in."}</p>
      </div>
    </div>
  );
};

export default Home;
