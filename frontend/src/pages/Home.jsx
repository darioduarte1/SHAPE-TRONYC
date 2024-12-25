// Home.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

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
            {/* Header fijo en la parte superior */}
            <Header />

            {/* Contenido principal */}
            <div className="container mt-5 pt-5">
                <h1>Welcome to the Home Page!</h1>
                <p>You are successfully logged in.</p>
                <button className="btn btn-danger" onClick={() => {navigate('/logout');}}>Logout</button>
            </div>
        </div>
    );
};

export default Home;
