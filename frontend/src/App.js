import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginRegister from "./pages/LoginRegister";
import Logout from "./pages/Logout";
import Home from "./pages/Home";
import Home2 from "./components/Home2"; // Importando Home2

function App() {
    // Determinamos el basename dinámicamente
    const basename = process.env.NODE_ENV === "production" ? "/SHAPE-TRONYC" : "";

    // Configuración de flags futuras de React Router
    const routerFutureConfig = {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    };

    return (
        <Router basename={basename} future={routerFutureConfig}>
            <Routes>
                {/* Redirección de la raíz a la página de autenticación */}
                <Route path="/" element={<Navigate to="/auth" replace />} />

                {/* Rutas existentes */}
                <Route path="/auth" element={<LoginRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/logout" element={<Logout />} />

                {/* Nueva ruta para el componente Home2 */}
                <Route path="/home2" element={<Home2 />} />
            </Routes>
            
            {/* Configuración de notificaciones */}
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
        </Router>
    );
}

export default App;
