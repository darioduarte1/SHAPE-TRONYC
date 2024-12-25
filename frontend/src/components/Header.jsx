import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Offcanvas } from "bootstrap";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const leftOffcanvasRef = useRef(null);
    const leftButtonRef = useRef(null);
    const leftOffcanvasInstance = useRef(null);

    const handleOpenOffcanvas = () => {
        const offcanvasElement = leftOffcanvasRef.current;
        const buttonElement = leftButtonRef.current;

        if (offcanvasElement) {
            const offcanvasInstance = Offcanvas.getOrCreateInstance(offcanvasElement);
            leftOffcanvasInstance.current = offcanvasInstance;
            offcanvasInstance.show();
            buttonElement.blur();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest(".offcanvas-start")) {
                if (leftOffcanvasInstance.current) leftOffcanvasInstance.current.hide();
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);

            if (leftOffcanvasInstance.current) {
                leftOffcanvasInstance.current.dispose();
                leftOffcanvasInstance.current = null;
            }
        };
    }, []);

    return (
        <header>
            <nav className="navbar navbar-dark bg-dark fixed-top">
                <div className="container-fluid">
                    {/* Botón para abrir el offcanvas izquierdo */}
                    <button
                        ref={leftButtonRef}
                        className="navbar-toggler"
                        type="button"
                        aria-controls="leftOffcanvas"
                        onClick={handleOpenOffcanvas}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <span className="navbar-brand">Mi App</span>
                    {/* Dropdown en el lado derecho */}
                    <div className="dropdown">
                        <button
                            className="btn btn-secondary"
                            type="button"
                            id="settingsDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="bi bi-gear-fill"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                            <li>
                                <a className="dropdown-item" href="#">
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="#">
                                    Configuración
                                </a>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button
                                    className="btn btn-danger w-100"
                                    onClick={() => {
                                        navigate("/logout");
                                    }}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Offcanvas izquierdo */}
            <div
                ref={leftOffcanvasRef}
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="leftOffcanvas"
                aria-labelledby="leftOffcanvasLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="leftOffcanvasLabel">
                        Menú
                    </h5>
                </div>
                <div className="offcanvas-body">
                    <p>Contenido del menú desplegable izquierdo.</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
