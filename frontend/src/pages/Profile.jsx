import React, { useState, useEffect } from "react";
import "../styles/Profile.css";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    age: "",
    gender: "",
    profilePicture: "",
    email: "",
    phone: "",
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setProfilePicturePreview(data.profilePicture);
        } else {
          toast.error("Error al obtener los datos del perfil.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al conectar con el servidor.");
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfileData({ ...profileData, profilePicture: file });
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      formData.append(key, profileData[key]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success("Perfil actualizado correctamente.");
      } else {
        toast.error("Error al actualizar el perfil.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="profile-container">
      <h1>Mi Perfil</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Nombre completo:</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={profileData.fullName}
          onChange={handleInputChange}
        />

        <label htmlFor="age">Edad:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={profileData.age}
          onChange={handleInputChange}
        />

        <label htmlFor="gender">Género:</label>
        <select
          id="gender"
          name="gender"
          value={profileData.gender}
          onChange={handleInputChange}
        >
          <option value="">Seleccionar</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
        </select>

        <label htmlFor="profilePicture">Foto de perfil (opcional):</label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          accept="image/*"
          onChange={handleProfilePictureChange}
        />
        {profilePicturePreview && (
          <img
            src={profilePicturePreview}
            alt="Profile Preview"
            className="profile-preview"
          />
        )}

        <label htmlFor="email">Correo electrónico:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={profileData.email}
          onChange={handleInputChange}
        />

        <label htmlFor="phone">Teléfono de contacto:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={profileData.phone}
          onChange={handleInputChange}
        />

        <button type="submit">Actualizar Perfil</button>
      </form>
    </div>
  );
};

export default Profile;
