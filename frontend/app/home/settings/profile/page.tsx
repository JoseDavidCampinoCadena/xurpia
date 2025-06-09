"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MiniSidebar from "../components/MiniSidebar";
import { useAuth } from '@/app/hooks/useAuth';
import { usersApi } from '@/app/api/users.api';
import { membershipApi, MembershipInfo } from '@/app/api/membership.api';
import { setCookie } from '@/app/utils/cookies';
import Image from 'next/image';
import { FaUserCircle, FaCrown, FaCheck, FaSpinner } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import countryList from 'react-select-country-list';

const ProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [description, setDescription] = useState("");
  const [profession, setProfession] = useState(user?.profession || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>("");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [languages, setLanguages] = useState<string[]>(user?.languages || []);  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const countryOptions = countryList().getData();
  const languageOptions = [
    'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Ruso', 'Árabe', 'Otro'
  ];  useEffect(() => {
    if (user?.description) setDescription(user.description);
    if (user?.profession) setProfession(user.profession);
    if (user?.profileImage) setProfileImagePreview(user.profileImage);
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.gender) setGender(user.gender);
    if (user?.nationality) setNationality(user.nationality);
    if (user?.languages) setLanguages(user.languages);
      // Load membership information
    loadMembershipInfo();
    
    // Check if coming from successful payment
    if (searchParams.get('payment') === 'success') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [user, searchParams]);
  const loadMembershipInfo = async () => {
    try {
      setLoadingMembership(true);
      const membershipInfo = await membershipApi.getUserMembership();
      setMembership(membershipInfo);
    } catch (error) {
      setMembershipError("Error al cargar información de membresía");
      console.error("Error loading membership:", error);
    } finally {
      setLoadingMembership(false);
    }
  };
  const handleUpgradeMembership = async (membershipType: 'PRO' | 'ENTERPRISE') => {
    // Redirigir a la página de pago
    router.push(`/payment?plan=${membershipType}`);
  };

  const handleDowngradeMembership = async () => {
    try {
      setUpgrading(true);
      setMembershipError("");
      await membershipApi.downgradeMembership();
      await loadMembershipInfo(); // Reload membership info
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setMembershipError("Error al degradar membresía");
      console.error("Error downgrading membership:", error);
    } finally {
      setUpgrading(false);
    }
  };

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
      formData.append('profession', profession); // Guardar profesión correctamente
      formData.append('gender', gender);
      if (profileImage) formData.append('profileImage', profileImage);
      if (cvFile) formData.append('cv', cvFile);
      formData.append('nationality', nationality);
      formData.append('languages', JSON.stringify(languages));
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
  };  return (
    <div className="flex min-h-screen   text-white">
      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Contenido */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header mejorado */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#26D07C] via-[#20B369] to-[#1AA05E] bg-clip-text text-transparent">
            ✨ Mi Perfil
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Personaliza tu experiencia y gestiona tu membresía para desbloquear todo el potencial
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#26D07C] to-[#20B369] mx-auto mt-4 rounded-full"></div>
        </div>        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-black via-green-900/80 to-green-400/20 backdrop-blur-sm border border-green-400/30 backdrop-blur-sm border border-gray-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#26D07C] rounded-full blur-3xl opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-10"></div>
            
            <div className="relative">
              <form
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-6"
          >            {/* Imagen de perfil mejorada */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4 group">
                <div className="relative cursor-pointer" onClick={() => document.getElementById('profile-image-input')?.click()}>
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview.startsWith('http') || profileImagePreview.startsWith('/uploads')
                        ? (profileImagePreview.startsWith('http') ? profileImagePreview : `http://localhost:3001${profileImagePreview}`)
                        : '/file.svg'}
                      alt="Foto de perfil"
                      width={200}
                      height={200}
                      className="rounded-full object-cover border-4 border-[#26D07C] bg-white w-32 h-32 md:w-48 md:h-48 shadow-2xl transition-all duration-300 hover:border-[#20B369] hover:shadow-[#26D07C]/20"
                      loader={({ src }) => profileImagePreview.startsWith('blob:') ? profileImagePreview : src}
                      unoptimized={profileImagePreview.startsWith('blob:')}
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-[#26D07C] flex items-center justify-center shadow-2xl">
                      <FaUserCircle className="w-16 h-16 md:w-24 md:h-24 text-[#26D07C]" />
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <div className="bg-[#26D07C] rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">Foto de Perfil</h3>
                <p className="text-sm text-gray-400">Haz clic en la imagen para cambiar tu foto</p>
              </div>
            </div>{/* Información personal - Grid Layout */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="name">
                  👤 Nombre Completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="email">
                  📧 Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <MdEmail className="text-[#26D07C] w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl pl-12 pr-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>
            </div>            {/* Descripción profesional */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="description">
                📝 Descripción Profesional
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300 resize-none"
                placeholder="Cuéntanos sobre ti, tu experiencia y habilidades profesionales..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">💡 Comparte tu experiencia y habilidades para destacar en la comunidad</p>
            </div>            {/* Información adicional - Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Profesión/Área */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  💼 Profesión/Área
                </label>                <select
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white transition-all duration-300"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  required
                >
                  <option value="">Selecciona tu área profesional</option>
                  <option value="Backend">Backend Developer</option>
                  <option value="Frontend">Frontend Developer</option>
                  <option value="Fullstack">Fullstack Developer</option>
                  <option value="DevOps">DevOps Engineer</option>
                  <option value="Data Science">Data Scientist</option>
                  <option value="Machine Learning">ML Engineer</option>
                  <option value="UI/UX">UI/UX Designer</option>
                  <option value="QA">QA Engineer</option>
                  <option value="Mobile">Mobile Developer</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Ventas">Sales</option>
                  <option value="Producto">Product Manager</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Género */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🧑‍🤝‍🧑 Género
                </label>                <select
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white transition-all duration-300"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="">Selecciona tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No binario">No binario</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>
            </div>

            {/* CV Upload mejorado */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📄 Hoja de Vida (CV)
              </label>
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-4 bg-black/30 rounded-xl border-2 border-dashed border-green-400/30 hover:border-green-400 transition-all duration-300 p-6">
                  <div className="flex items-center gap-3 flex-1">
                    <HiOutlineDocumentArrowDown className="text-[#26D07C] w-8 h-8" />
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleCvChange} 
                        className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#26D07C] file:text-white hover:file:bg-[#20B369] file:cursor-pointer"
                      />
                      {cvFileName && (
                        <p className="text-sm text-[#26D07C] mt-1 font-medium">📎 {cvFileName}</p>
                      )}
                    </div>
                  </div>
                  {user?.cvUrl && (
                    <a
                      href={user.cvUrl.startsWith('http') ? user.cvUrl : `http://localhost:3001${user.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#26D07C] hover:bg-[#20B369] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                    >
                      <HiOutlineDocumentArrowDown />
                      Ver CV Actual
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Información internacional - Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Nacionalidad */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🌍 Nacionalidad
                </label>                <select
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white transition-all duration-300"
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  required
                >
                  <option value="">Selecciona tu país</option>
                  {countryOptions.map((c: { value: string; label: string }) => (
                    <option key={c.value} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Idiomas */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🗣️ Idiomas
                </label>                <select
                  multiple
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white transition-all duration-300 min-h-[120px]"
                  value={languages}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setLanguages(selected);
                  }}
                  required
                >
                  {languageOptions.map(lang => (
                    <option key={lang} value={lang} className="py-2">{lang}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">💡 Mantén presionado Ctrl/Cmd y haz clic para seleccionar múltiples idiomas</p>
              </div>
            </div>{/* Membresía */}
            <div className="border-t border-gray-600 pt-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#26D07C] to-[#20B369] bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <FaCrown className="text-yellow-400 text-2xl" />
                  Tu Plan de Membresía
                </h3>
                <p className="text-gray-400 text-sm">Gestiona tu suscripción y descubre nuevas funcionalidades</p>
              </div>
              
              {loadingMembership ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-black via-green-900/80 to-green-400/20 backdrop-blur-sm border border-green-400/30">
                  <FaSpinner className="animate-spin text-[#26D07C] w-12 h-12 mb-4" />
                  <span className="text-lg text-gray-300">Cargando información de membresía...</span>
                  <div className="w-32 h-1  rounded-full mt-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-[#26D07C] to-[#20B369] animate-pulse"></div>
                  </div>
                </div>
              ) : membership ? (                <div className="space-y-8">
                  {/* Current membership display */}
                  <div className="relative bg-gradient-to-br from-black to-black backdrop-blur-sm border-2 border-green-700 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#26D07C] rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"></div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                          <div className="relative">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#26D07C]/20 to-[#26D07C]/10 border border-[#26D07C]/30">
                              {membership.type === 'ENTERPRISE' ? (
                                <FaCrown className="text-yellow-400 w-10 h-10" />
                              ) : membership.type === 'PRO' ? (
                                <FaCrown className="text-blue-400 w-10 h-10" />
                              ) : (
                                <FaCheck className="text-green-400 w-10 h-10" />
                              )}
                            </div>
                            {membership.type !== 'FREE' && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#26D07C] rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-3xl text-white mb-1">
                              Plan {membership.type}
                            </h4>
                            <p className="text-xl font-bold bg-gradient-to-r from-[#26D07C] to-[#20B369] bg-clip-text text-transparent">
                              {membership.price}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-400 font-medium">Activo</span>
                            </div>
                          </div>
                        </div>
                        
                        {membership.expiresAt && (
                          <div className="bg-gradient-to-br from-black via-green-900/80 to-green-400/20 backdrop-blur-sm border border-green-400/30 p-4 rounded-xl">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Válido hasta:</p>
                            <p className="text-lg font-bold text-white">
                              {new Date(membership.expiresAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h5 className="text-lg font-bold text-white mb-4">📊 Límites de uso</h5>
                          <div className="bg-gradient-to-br from-black to-green-400/20 backdrop-blur-sm border border-green-400/30 p-4 rounded-xl ">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-3 h-3 bg-[#26D07C] rounded-full shadow-lg shadow-[#26D07C]/50"></div>
                              <span className="text-white font-semibold">
                                Evaluaciones por proyecto: 
                                <span className="text-[#26D07C] ml-2">
                                  {membership.evaluationLimits.perProject === -1 ? '∞ Ilimitadas' : membership.evaluationLimits.perProject}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 pl-6">{membership.evaluationLimits.description}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-lg font-bold text-white mb-4">🚀 Características premium</h5>
                          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                            {membership.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                                <FaCheck className="text-green-400 w-4 h-4 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-200 leading-relaxed">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade/Downgrade buttons */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {membership.type === 'FREE' && (
                      <>
                        <div className="bg-gradient-to-r from-[#4D7A40] to-[#3EFA05] rounded-xl p-6 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-[#52BA32] text-xs px-2 py-1 rounded-bl-lg font-bold">
                            POPULAR
                          </div>
                          <FaCrown className="text-blue-200 w-8 h-8 mb-3" />
                          <h5 className="font-bold text-lg mb-2">Plan PRO</h5>
                          <p className="text-sm text-blue-100 mb-4">$30,000 COP/mes</p>
                          <ul className="text-xs space-y-1 mb-4 text-blue-100">
                            <li>✓ 3 evaluaciones por proyecto</li>
                            <li>✓ Análisis detallado</li>
                            <li>✓ Reportes avanzados</li>
                          </ul>
                          <button
                            onClick={() => handleUpgradeMembership('PRO')}
                            disabled={upgrading}
                            className="w-full bg-white text-[#52BA32] py-3 rounded-lg font-bold transition hover:bg-blue-50 disabled:opacity-50"
                          >
                            {upgrading ? 'Procesando...' : 'Actualizar a PRO'}
                          </button>
                        </div>
                        
                        <div className="bg-gradient-to-r from-[#FA05D1] to-[#A53A93] rounded-xl p-6 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-[#A53A93] text-xs px-2 py-1 rounded-bl-lg font-bold">
                            PREMIUM
                          </div>
                          <FaCrown className="text-[#e7e6e7] w-8 h-8 mb-3" />
                          <h5 className="font-bold text-lg mb-2">Plan ENTERPRISE</h5>
                          <p className="text-sm text-yellow-100 mb-4">$120,000 COP/mes</p>
                          <ul className="text-xs space-y-1 mb-4 text-yellow-100">
                            <li>✓ Evaluaciones ilimitadas</li>
                            <li>✓ Soporte 24/7</li>
                            <li>✓ API personalizada</li>
                          </ul>
                          <button
                            onClick={() => handleUpgradeMembership('ENTERPRISE')}
                            disabled={upgrading}
                            className="w-full bg-white text-[#A53A93] py-3 rounded-lg font-bold transition hover:bg-yellow-50 disabled:opacity-50"
                          >
                            {upgrading ? 'Procesando...' : 'Actualizar a ENTERPRISE'}
                          </button>
                        </div>
                      </>
                    )}
                    
                    {membership.type === 'PRO' && (
                      <>
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
                          <FaCrown className="text-yellow-200 w-8 h-8 mb-3" />
                          <h5 className="font-bold text-lg mb-2">Plan ENTERPRISE</h5>
                          <p className="text-sm text-yellow-100 mb-4">$120,000 COP/mes</p>
                          <button
                            onClick={() => handleUpgradeMembership('ENTERPRISE')}
                            disabled={upgrading}
                            className="w-full bg-white text-yellow-600 py-3 rounded-lg font-bold transition hover:bg-yellow-50 disabled:opacity-50"
                          >
                            {upgrading ? 'Procesando...' : 'Actualizar a ENTERPRISE'}
                          </button>
                        </div>
                        <div className="bg-gray-700 rounded-xl p-6 text-white">
                          <h5 className="font-bold text-lg mb-2">¿No necesitas PRO?</h5>
                          <p className="text-sm text-gray-300 mb-4">Degradar a plan gratuito</p>
                          <button
                            onClick={handleDowngradeMembership}
                            disabled={upgrading}
                            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                          >
                            {upgrading ? 'Procesando...' : 'Degradar a FREE'}
                          </button>
                        </div>
                      </>
                    )}
                    
                    {membership.type === 'ENTERPRISE' && (
                      <div className="bg-gray-700 rounded-xl p-6 text-white col-span-full max-w-md mx-auto">
                        <h5 className="font-bold text-lg mb-2 text-center">¿No necesitas ENTERPRISE?</h5>
                        <p className="text-sm text-gray-300 mb-4 text-center">Degradar a plan gratuito</p>
                        <button
                          onClick={handleDowngradeMembership}
                          disabled={upgrading}
                          className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {upgrading ? 'Procesando...' : 'Degradar a FREE'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {membershipError && (
                    <div className="text-red-400 text-sm text-center bg-red-900/20 p-4 rounded-lg border border-red-700">
                      <strong>Error:</strong> {membershipError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                  <p className="text-gray-400 mb-6 text-lg">No se pudo cargar la información de membresía</p>
                  <button
                    onClick={loadMembershipInfo}
                    className="bg-[#26D07C] hover:bg-[#1bb86c] text-white px-6 py-3 rounded-lg font-bold transition"
                  >
                    🔄 Reintentar
                  </button>
                </div>
              )}
            </div>            {/* Feedback Messages */}
            {success && (
              <div className="bg-green-900/20 border border-green-700 text-green-400 text-center font-bold p-4 rounded-xl flex items-center justify-center gap-2">
                <FaCheck className="w-5 h-5" />
                ¡Perfil actualizado exitosamente!
              </div>
            )}
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 text-center font-bold p-4 rounded-xl flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#26D07C] to-[#20B369] hover:from-[#20B369] hover:to-[#1AA05E] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[#26D07C]/20 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin w-5 h-5" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <FaCheck className="w-5 h-5" />
                  Guardar Perfil
                </>
              )}
            </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;