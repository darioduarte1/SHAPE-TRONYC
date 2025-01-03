import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Crear una instancia de Axios
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

// Interceptor para manejar errores en las respuestas (como token expirado)
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // Devolvemos la respuesta si no hay errores
    },
    async (error) => {
        const originalRequest = error.config;
        const navigate = useNavigate(); // Para redirigir al usuario si es necesario

        // Verificamos si el error es de autenticación (401)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marcamos el intento de repetición para evitar bucles infinitos

            const refreshToken = localStorage.getItem('refresh'); // Obtenemos el token de actualización
            if (refreshToken) {
                try {
                    // Hacemos la solicitud para actualizar el token
                    const response = await axios.post('http://localhost:8000/auth/token/refresh/', {
                        refresh: refreshToken,
                    });

                    // Guardamos el nuevo token en localStorage
                    localStorage.setItem('access', response.data.access);

                    // Añadimos el nuevo token a la solicitud original
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                    // Reintentamos la solicitud original con el nuevo token
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    // Si la actualización falla, redirigimos al usuario al login
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    navigate('/login');
                    return Promise.reject(refreshError);
                }
            } else {
                // Si no hay token de actualización, redirigimos al login
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            }
        }

        return Promise.reject(error); // Devolvemos el error si no es manejable
    }
);

export default axiosInstance;
