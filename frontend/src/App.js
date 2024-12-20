import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Home from './pages/Home';

function App() {
    return (
        <Router>
            <Routes>

                {/* Ruta raíz redirige a /login */}
                    <Route path="/" element={<Navigate to="/login" />} />

                {/* Rutas específicas */}
                    <Route path="/home" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
            </Routes>
        </Router>
    );
}

export default App;