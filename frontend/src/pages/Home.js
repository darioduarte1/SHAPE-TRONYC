import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si los tokens están en el localStorage
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');

        if (!accessToken || !refreshToken) {
            // Si no hay tokens, redirigir al login
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <p>You are successfully logged in.</p>
            <button
                onClick={() => {
                    // Limpiar los tokens del localStorage y redirigir al login
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    navigate('/login');
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default Home;
