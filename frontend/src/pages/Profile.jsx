import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Profile = () => {
  const userId = localStorage.getItem("user_id"); // Obtenemos el userId de manera segura

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "M",
    profilePhoto: null,
    email: "",
    contactPhone: "",
    profilePictureUrl: "",
  });

  useEffect(() => {
    // Si no hay userId, evitamos hacer la llamada a la API
    if (!userId) {
      toast.error("No se encontró el ID del usuario.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            fullName: data.full_name || "",
            age: data.age || "",
            gender: data.gender || "M",
            profilePhoto: null,
            profilePictureUrl: data.profile_picture || "", // Aseguramos que se asigna la URL correcta
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
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || "" });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("full_name", formData.fullName);
    data.append("age", formData.age);
    data.append("gender", formData.gender);
    if (formData.profilePhoto) {
      data.append("profile_picture", formData.profilePhoto);
    }
    data.append("contact_number", formData.contactPhone);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: data,
      });

      if (response.ok) {
        toast.success("Perfil actualizado con éxito.");
        const updatedData = await response.json();
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: updatedData.profile_picture, // Actualizamos la URL de la foto
        }));
      } else {
        const errorData = await response.json();
        toast.error(
          `Error al actualizar el perfil: ${
            errorData.error || "Revisa los datos ingresados."
          }`
        );
      }
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Actualizar Información de Perfil</h2>
      {/* Mostrar la imagen dentro de un círculo */}
      {formData.profilePictureUrl ? (
        <div className="text-center mb-4">
          <img
            src={formData.profilePictureUrl}
            alt="Foto de Perfil"
            className="profile-photo-circle"
          />
        </div>
      ) : (
        <div className="text-center mb-4">
          <img
            src="https://via.placeholder.com/150"
            alt="Foto de Perfil Predeterminada"
            className="profile-photo-circle"
          />
        </div>
      )}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            required
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="profilePhoto" className="form-label">
            Foto de Perfil (opcional)
          </label>
          <input
            type="file"
            className="form-control"
            id="profilePhoto"
            name="profilePhoto"
            onChange={handleFileChange}
          />
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
            Teléfono de Contacto (si aplica)
          </label>
          <input
            type="tel"
            className="form-control"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
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
