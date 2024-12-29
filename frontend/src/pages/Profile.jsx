import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "M",
    profilePhoto: null,
    email: "",
    contactPhone: "",
    profilePictureUrl: "https://via.placeholder.com/150",
  });

  // Obtén el idioma almacenado en el localStorage
  const language = localStorage.getItem("language") || "en";

  // Traducciones
  const translations = {
    en: {
      updateProfile: "Update Profile Information",
      fullName: "Full Name",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      email: "Email",
      contactPhone: "Contact Phone",
      updateButton: "Update Profile",
    },
    es: {
      updateProfile: "Actualizar Información de Perfil",
      fullName: "Nombre Completo",
      age: "Edad",
      gender: "Género",
      male: "Masculino",
      female: "Femenino",
      other: "Otro",
      email: "Correo Electrónico",
      contactPhone: "Teléfono de Contacto",
      updateButton: "Actualizar Perfil",
    },
    pt: {
      updateProfile: "Atualizar Informações do Perfil",
      fullName: "Nome Completo",
      age: "Idade",
      gender: "Gênero",
      male: "Masculino",
      female: "Feminino",
      other: "Outro",
      email: "Email",
      contactPhone: "Telefone de Contato",
      updateButton: "Atualizar Perfil",
    },
  };

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
            profilePhoto: null,
            profilePictureUrl: data.profile_picture || "https://via.placeholder.com/150",
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
    setFormData({ ...formData, profilePhoto: file });
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
      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${localStorage.getItem("user_id")}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: data,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setFormData((prevState) => ({
          ...prevState,
          profilePictureUrl: updatedData.profile_picture || "https://via.placeholder.com/150",
        }));
        toast.success(translations[language].updateButton + " success!");
        navigate("/home");
      } else {
        const errorData = await response.json();
        toast.error(
          `Error: ${errorData.error || "Please check the input data."}`
        );
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">{translations[language].updateProfile}</h2>
      <div className="text-center mb-4 position-relative">
        <img
          src={formData.profilePictureUrl}
          alt="Profile"
          className="profile-photo-circle"
        />
        <label htmlFor="profilePhoto" className="camera-icon" aria-label={translations[language].updateProfile}>
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
            {translations[language].fullName}
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
            {translations[language].age}
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
            {translations[language].gender}
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
            <option value="M">{translations[language].male}</option>
            <option value="F">{translations[language].female}</option>
            <option value="O">{translations[language].other}</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            {translations[language].email}
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
            {translations[language].contactPhone}
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
          {translations[language].updateButton}
        </button>
      </form>
    </div>
  );
};

export default Profile;
