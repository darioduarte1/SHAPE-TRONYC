import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginRegister from "./pages/LoginRegister";
import Logout from "./pages/Logout";
import Home from "./pages/Home";


function App() {
    const futureFlags = {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    };

    return (
        <Router future={futureFlags}>
            <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<LoginRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Router>
    );
}

export default App;
