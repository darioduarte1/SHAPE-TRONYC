import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importa los estilos de react-toastify
import LoginRegister from "./pages/LoginRegister";
import Logout from "./pages/Logout";
import Home from "./pages/Home";

function App() {
    return (
        <>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Redirección de la ruta raíz */}
                    <Route path="/" element={<Navigate to="/auth" replace />} />

                    {/* Rutas específicas */}
                    <Route path="/auth" element={<LoginRegister />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </Router>

            {/* Contenedor de Toast para notificaciones */}
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}

export default App;
