import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = () => {
            // Limpia los tokens del localStorage
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user_id");

            // Muestra un solo toast y redirige
            toast.success("Logout realizado con éxito", { toastId: "logout-success" });
            navigate("/auth", { replace: true });
        };

        performLogout();
    }, [navigate]);

    return <h1>Realizando logout...</h1>;
};

export default Logout;