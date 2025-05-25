"use client";
import React, { useState, useEffect } from "react";
import MiniSidebar from "../components/MiniSidebar";
import { useAuth } from '@/app/hooks/useAuth';
import { usersApi } from '@/app/api/users.api';
import { setCookie } from '@/app/utils/cookies';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [description, setDescription] = useState("");
  const [interest, setInterest] = useState(user?.interest || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>("");

  useEffect(() => {
    if (user?.description) setDescription(user.description);
    if (user?.interest) setInterest(user.interest);
    if (user?.profileImage) setProfileImagePreview(user.profileImage);
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.gender) setGender(user.gender);
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSuccess(false);
    setError("");
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('description', description);
      formData.append('interest', interest);
      formData.append('gender', gender);
      if (profileImage) formData.append('profileImage', profileImage);
      if (cvFile) formData.append('cv', cvFile);
      const updated = await usersApi.updateUserProfile(user.id, formData);
      setUser(updated);
      setCookie('user', JSON.stringify(updated));
      setSuccess(true);
    } catch {
      setError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Contenido */}
      <div className="flex-1 p-6">
        <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12 text-center">Editar Perfil</h1>
        <div className="border-green-300 border-2 p-4 rounded-lg mt-4 max-w-xl mx-auto bg-[#232323]">
          <form
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-6"
          >
            {/* Imagen de perfil */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative mb-2">
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview.startsWith('http') || profileImagePreview.startsWith('/uploads')
                      ? (profileImagePreview.startsWith('http') ? profileImagePreview : `http://localhost:3001${profileImagePreview}`)
                      : '/file.svg'}
                    alt="Foto de perfil"
                    width={200}
                    height={200}
                    className="rounded-full object-cover border-4 border-[#26D07C] bg-white w-24 h-24 md:w-40 md:h-40"
                    loader={({ src }) => profileImagePreview.startsWith('blob:') ? profileImagePreview : src}
                    unoptimized={profileImagePreview.startsWith('blob:')}
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 md:w-40 md:h-40 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                  title="Cambiar foto"
                />
              </div>
              <span className="text-xs text-gray-400">Haz click en la imagen para cambiar tu foto</span>
            </div>
            {/* Nombre y correo */}
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg px-4 py-2 bg-[#181818] border border-[#26D07C] focus:border-[#26D07C] outline-none text-white"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="email">Correo</label>
              <div className="flex items-center bg-[#181818] rounded-lg border border-[#26D07C] px-4">
                <MdEmail className="text-[#26D07C] mr-2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 py-2 bg-transparent outline-none text-white"
                  placeholder="Correo"
                  required
                />
              </div>
            </div>
            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg px-4 py-2 bg-[#181818] border border-[#26D07C] focus:border-[#26D07C] outline-none text-white resize-none"
                placeholder="Agrega una descripción sobre ti"
                rows={3}
              />
              <p className="text-gray-400 text-xs mt-1">
                Editar tu biografía o descripción está ahora disponible en Xurp IA. ¡Atrévete a que te conozcan un poco!
              </p>
            </div>
            {/* Subir hoja de vida */}
            <div>
              <label className="block text-sm font-bold mb-1">Hoja de vida (CV)</label>
              <div className="flex flex-col md:flex-row items-center gap-3 bg-[#181818] rounded-lg border border-[#26D07C] px-4 py-2">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="flex-1" />
                {cvFileName && <span className="text-xs text-[#26D07C]">{cvFileName}</span>}
                {user?.cvUrl && (
                  <a
                    href={user.cvUrl.startsWith('http') ? user.cvUrl : `http://localhost:3001${user.cvUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-[#26D07C] flex items-center gap-1"
                  >
                    <HiOutlineDocumentArrowDown className="inline-block" /> Ver CV
                  </a>
                )}
              </div>
            </div>
            {/* Género */}
            <div>
              <label className="block text-sm font-bold mb-1">Género</label>
              <select
                className="w-full rounded-lg px-4 py-2 bg-[#181818] border border-[#26D07C] text-white outline-none"
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Prefiero no decirlo</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            {/* Interés */}
            <div>
              <label className="block text-sm font-bold mb-1">Área de Interés</label>
              <select
                className="w-full rounded-lg px-4 py-2 bg-[#181818] border border-[#26D07C] text-white outline-none"
                value={interest}
                onChange={e => setInterest(e.target.value)}
              >
                <option value="">Selecciona tu área de interés</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="Diseño">Diseño</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="QA">QA</option>
                <option value="Mobile">Mobile</option>
                <option value="Marketing">Marketing</option>
                <option value="Ventas">Ventas</option>
                <option value="Producto">Producto</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            {/* Feedback */}
            {success && <div className="text-green-400 text-center font-bold">¡Perfil actualizado!</div>}
            {error && <div className="text-red-400 text-center font-bold">{error}</div>}
            <button
              type="submit"
              className="w-full bg-[#26D07C] text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-[#1bb86c] transition"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;