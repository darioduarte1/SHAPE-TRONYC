import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar la interfaz de reserva en caso de error
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error capturado por ErrorBoundary:", error);
    console.error("Información del error:", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Ocurrió un error</h2>
          <p>Algo salió mal. Intenta recargar la página.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
