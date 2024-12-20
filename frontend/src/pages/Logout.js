import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Obtén el refresh token del localStorage
                const refreshToken = localStorage.getItem('refresh');

                if (refreshToken) {
                    // Enviar el refresh token al backend para invalidarlo
                    await axios.post('http://localhost:8000/auth/logout/', {
                        refresh: refreshToken,
                    });
                }

                // Eliminar los tokens del localStorage
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');

                // Redirigir al login
                navigate('/login');
            } catch (error) {
                // En caso de error, asegurarse de limpiar los tokens y redirigir
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            }
        };

        performLogout();
    }, [navigate]);

    return <h1>Logging out...</h1>;
};

export default Logout;
