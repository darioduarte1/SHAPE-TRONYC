import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000', // Cambia esta URL por la de tu backend.
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a las solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access'); // Obtenemos el token del Local Storage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Lo añadimos al encabezado
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
