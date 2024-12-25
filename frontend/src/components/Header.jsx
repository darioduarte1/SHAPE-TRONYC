import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Offcanvas } from "bootstrap";

const Header = () => {
    const offcanvasRef = useRef(null);
    const buttonRef = useRef(null);
    let offcanvasInstance = null;

    const handleOpenOffcanvas = () => {
        const offcanvasElement = offcanvasRef.current;

        if (offcanvasElement) {
            // Inicializar la instancia de Offcanvas si no existe
            offcanvasInstance = Offcanvas.getOrCreateInstance(offcanvasElement);
            offcanvasInstance.show();
        }
    };

    const handleCloseOffcanvas = () => {
        if (offcanvasInstance) {
            offcanvasInstance.hide();
        }

        // Asegurarse de que el botón no quede sombreado
        if (buttonRef.current) {
            buttonRef.current.blur();
        }
    };

    useEffect(() => {
        const offcanvasElement = offcanvasRef.current;

        if (offcanvasElement) {
            // Añadir evento para cerrar al hacer clic en cualquier parte del cuerpo
            const handleClickOutside = (event) => {
                if (offcanvasInstance && event.target.closest(".offcanvas")) {
                    handleCloseOffcanvas();
                }
            };

            offcanvasElement.addEventListener("hidden.bs.offcanvas", () => {
                document.body.classList.remove("offcanvas-open");
            });

            document.addEventListener("click", handleClickOutside);

            return () => {
                // Limpiar eventos al desmontar el componente
                if (offcanvasInstance) {
                    offcanvasInstance.dispose();
                    offcanvasInstance = null;
                }
                document.removeEventListener("click", handleClickOutside);
            };
        }
    }, []);

    return (
        <header>
            <nav className="navbar navbar-dark bg-dark fixed-top">
                <div className="container-fluid">
                    <button
                        ref={buttonRef}
                        className="navbar-toggler"
                        type="button"
                        aria-controls="offcanvasExample"
                        onClick={handleOpenOffcanvas}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <a className="navbar-brand" href="#">
                        Mi App
                    </a>
                </div>
            </nav>

            <div
                ref={offcanvasRef}
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="offcanvasExample"
                aria-labelledby="offcanvasExampleLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasExampleLabel">
                        Menú
                    </h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        aria-label="Close"
                        onClick={handleCloseOffcanvas}
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <p>Contenido del menú desplegable.</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
