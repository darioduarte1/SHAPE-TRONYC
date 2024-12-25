import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Offcanvas } from "bootstrap";

const Header = () => {
    const leftOffcanvasRef = useRef(null);
    const rightOffcanvasRef = useRef(null);
    const leftButtonRef = useRef(null);
    const rightButtonRef = useRef(null);

    let leftOffcanvasInstance = null;
    let rightOffcanvasInstance = null;

    const handleOpenOffcanvas = (side) => {
        const offcanvasElement =
            side === "left" ? leftOffcanvasRef.current : rightOffcanvasRef.current;
        const buttonElement =
            side === "left" ? leftButtonRef.current : rightButtonRef.current;

        if (offcanvasElement) {
            const offcanvasInstance = Offcanvas.getOrCreateInstance(offcanvasElement);

            if (side === "left") {
                leftOffcanvasInstance = offcanvasInstance;
            } else {
                rightOffcanvasInstance = offcanvasInstance;
            }

            offcanvasInstance.show();
            buttonElement.blur();
        }
    };

    const handleCloseOffcanvas = (side) => {
        const offcanvasInstance =
            side === "left" ? leftOffcanvasInstance : rightOffcanvasInstance;
        const buttonElement =
            side === "left" ? leftButtonRef.current : rightButtonRef.current;

        if (offcanvasInstance) {
            offcanvasInstance.hide();
        }

        if (buttonElement) {
            buttonElement.blur();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                event.target.closest(".offcanvas-start") ||
                event.target.closest(".offcanvas-end")
            ) {
                if (leftOffcanvasInstance) leftOffcanvasInstance.hide();
                if (rightOffcanvasInstance) rightOffcanvasInstance.hide();
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);

            if (leftOffcanvasInstance) {
                leftOffcanvasInstance.dispose();
                leftOffcanvasInstance = null;
            }
            if (rightOffcanvasInstance) {
                rightOffcanvasInstance.dispose();
                rightOffcanvasInstance = null;
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
                        onClick={() => handleOpenOffcanvas("left")}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <a className="navbar-brand" href="#">
                        Mi App
                    </a>
                    {/* Botón para abrir el offcanvas derecho */}
                    <button
                        ref={rightButtonRef}
                        className="btn btn-secondary"
                        type="button"
                        aria-controls="rightOffcanvas"
                        onClick={() => handleOpenOffcanvas("right")}
                    >
                        <i className="bi bi-gear-fill"></i>
                    </button>
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

            {/* Offcanvas derecho */}
            <div
                ref={rightOffcanvasRef}
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="rightOffcanvas"
                aria-labelledby="rightOffcanvasLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="rightOffcanvasLabel">
                        Configuración
                    </h5>
                </div>
                <div className="offcanvas-body">
                    <p>Área de configuración del usuario.</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
