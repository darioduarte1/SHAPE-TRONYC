import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
    
        try {
            const response = await axios.post('http://localhost:8000/auth/login/', formData);
            const { access, refresh } = response.data;
    
            // Almacenar los tokens en el localStorage
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
    
            // Mostrar el mensaje de éxito
            setMessage('Login successful!');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.error || 'Invalid credentials');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
    
            {/* Muestra el mensaje de éxito o error */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
