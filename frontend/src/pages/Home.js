import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('access');
        
        // Verificar si el token existe
        if (!accessToken) {
            // Si no hay token, redirigir al login
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <p>This page is only accessible if you are logged in.</p>
        </div>
    );
};

export default Home;
