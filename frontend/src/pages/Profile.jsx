import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Importación de Bootstrap Icons
import "../styles/Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Profile = () => {
  const navigate = useNavigate(); // Instancia del hook para redirección
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "M",
    profilePhoto: null,
    email: "",
    contactPhone: "",
    profilePictureUrl: "https://via.placeholder.com/150", // Placeholder inicial
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/profiles/${localStorage.getItem("user_id")}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFormData({
            fullName: data.full_name || "",
            age: data.age || "",
            gender: data.gender || "M",
            profilePhoto: null, // Se usa para la nueva subida
            profilePictureUrl: data.profile_picture || "https://via.placeholder.com/150", // Foto de Cloudinary o placeholder
            email: data.email || "",
            contactPhone: data.contact_number || "",
          });
        } else {
          toast.error("Error al cargar el perfil.");
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        toast.error("Error al cargar el perfil. Intenta nuevamente.");
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Archivo seleccionado:", file); // DEBUG: Verificar el archivo seleccionado
    setFormData({ ...formData, profilePhoto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("full_name", formData.fullName);
    data.append("age", formData.age);
    data.append("gender", formData.gender);

    if (formData.profilePhoto) {
      console.log(`Archivo seleccionado: ${formData.profilePhoto.name}, tamaño: ${formData.profilePhoto.size}`);
      console.log("Archivo adjuntado al FormData:", formData.profilePhoto); // DEBUG: Verificar el archivo antes de añadirlo
      data.append("profile_picture", formData.profilePhoto);
    } else {
      console.warn("No se ha seleccionado ningún archivo para subir."); // DEBUG: Mensaje si no hay archivo
    }

    data.append("contact_number", formData.contactPhone);

    console.log("Datos enviados en FormData:");
    for (let pair of data.entries()) {
      console.log(`${pair[0]}:`, pair[1]); // DEBUG: Verificar todos los datos en FormData
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${localStorage.getItem("user_id")}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: data, // FormData object
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Respuesta del servidor:", updatedData); // DEBUG: Verificar respuesta del servidor
        setFormData((prevState) => ({
          ...prevState,
          profilePictureUrl: updatedData.profile_picture || "https://via.placeholder.com/150",
        }));
        toast.success("Perfil actualizado con éxito.");
        navigate("/home"); // Redirige a la página de inicio
      } else {
        const errorData = await response.json();
        console.error("Errores del servidor:", errorData); // DEBUG: Verificar errores del servidor
        toast.error(
          `Error al actualizar el perfil: ${errorData.error || "Revisa los datos ingresados."}`
        );
      }
    } catch (err) {
      console.error("Error en la solicitud:", err); // DEBUG: Verificar error en la solicitud
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Actualizar Información de Perfil</h2>
      {/* Mostrar la imagen dentro de un círculo */}
      <div className="text-center mb-4 position-relative">
        <img
          src={formData.profilePictureUrl} // Usar URL de Cloudinary o placeholder
          alt="Foto de Perfil"
          className="profile-photo-circle"
        />
        <label htmlFor="profilePhoto" className="camera-icon" aria-label="Actualizar Foto de Perfil">
          <i className="bi bi-camera" style={{ fontSize: "24px", color: "gray" }}></i>
        </label>
        <input
          type="file"
          className="d-none"
          id="profilePhoto"
          onChange={handleFileChange}
        />
      </div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Resto del formulario */}
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">
            Nombre Completo
          </label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="age" className="form-label">
            Edad
          </label>
          <input
            type="number"
            className="form-control"
            id="age"
            name="age"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="gender" className="form-label">
            Género
          </label>
          <select
            className="form-select"
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            required
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactPhone" className="form-label">
            Teléfono de Contacto
          </label>
          <input
            type="tel"
            className="form-control"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Actualizar Perfil
        </button>
      </form>
    </div>
  );
};

export default Profile;
