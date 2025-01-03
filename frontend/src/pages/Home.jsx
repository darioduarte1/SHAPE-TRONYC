import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  const [loading, setLoading] = useState(true); // Indicador de carga
  const navigate = useNavigate();

  useEffect(() => {
    const manageTokens = () => {
      // Extraer tokens de la URL si están presentes
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Guardar tokens en localStorage
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);

        // Limpiar los parámetros de la URL
        window.history.replaceState({}, document.title, '/home');
        setLoading(false); // Desactiva el indicador de carga
      } else {
        // Validar si los tokens ya están en localStorage
        const storedAccessToken = localStorage.getItem('access');
        const storedRefreshToken = localStorage.getItem('refresh');

        if (!storedAccessToken || !storedRefreshToken) {
          navigate('/login'); // Redirigir al login si no hay tokens
        } else {
          setLoading(false); // Desactiva el indicador de carga si los tokens son válidos
        }
      }
    };

    manageTokens();
  }, [navigate]);

  if (loading) {
    return <div className="spinner">Cargando...</div>;
  }

  return (
    <div>
      <Header />
      <div className="container mt-5 pt-5">
        <h1>Welcome to the Home Page!</h1>
        <p>You are successfully logged in.</p>
      </div>
    </div>
  );
};

export default Home;
