import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  const [loading, setLoading] = useState(true); // Indicador de carga
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokens = () => {
      const accessToken = localStorage.getItem('access');
      const refreshToken = localStorage.getItem('refresh');

      if (!accessToken || !refreshToken) {
        navigate('/login');
      } else {
        setLoading(false); // Desactiva la carga una vez validados
      }
    };

    checkTokens();
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
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            navigate('/logout');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
