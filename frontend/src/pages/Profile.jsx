import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "M",
    profilePhoto: null,
    email: "",
    contactPhone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("user_id");
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
            profilePhoto: data.profile_picture || "https://via.placeholder.com/150",
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
    if (formData.profilePhoto instanceof File) {
      data.append("profile_picture", formData.profilePhoto);
    }
    data.append("contact_number", formData.contactPhone);

    try {
      const userId = localStorage.getItem("user_id");
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/`, {
        method: "PUT",
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
          `Error al actualizar el perfil: ${errorData.error || "Revisa los datos ingresados."}`
        );
      }
    } catch (err) {
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Actualizar Información de Perfil</h2>
      <div className="text-center mb-4 position-relative">
        <img
          src={
            typeof formData.profilePhoto === "string"
              ? formData.profilePhoto
              : "https://via.placeholder.com/150"
          }
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
