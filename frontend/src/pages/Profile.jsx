import React, { useState } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    profilePhoto: null,
    email: "",
    contactPhone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    data.append("profile_photo", formData.profilePhoto);
    data.append("email", formData.email);
    data.append("contact_phone", formData.contactPhone);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/update/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: data,
      });

      if (response.ok) {
        toast.success("Perfil actualizado con éxito.");
      } else {
        const errorData = await response.json();
        toast.error(
          `Error al actualizar el perfil: ${errorData.error || "Intenta nuevamente."}`
        );
      }
    } catch (err) {
      console.error("Error al actualizar el perfil", err);
      toast.error("Error al actualizar el perfil. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Actualizar Información de Perfil</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
            <option value="">Selecciona tu género</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
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
            onChange={handleInputChange}
            required
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
