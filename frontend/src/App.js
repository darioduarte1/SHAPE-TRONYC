import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginRegister from "./pages/LoginRegister";
import Logout from "./pages/Logout";
import Home from "./pages/Home";
import Home2 from "./components/Home2";

function App() {
    const basename = process.env.NODE_ENV === "production" ? "/SHAPE-TRONYC" : "/";

    return (
        <Router basename={basename}>
            <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<LoginRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/home2" element={<Home2 />} />
            </Routes>
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
