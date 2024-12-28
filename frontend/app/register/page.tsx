'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('👤 Intentando registrar nuevo usuario:', formData.email);

    if (!acceptTerms) {
      const errorMsg = 'Debes aceptar los términos y condiciones';
      console.log('❌ Error de registro:', errorMsg);
      setError(errorMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Las contraseñas no coinciden';
      console.log('❌ Error de registro:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      console.log('✅ Registro exitoso para:', response.user.name);
      router.push('./login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
      console.error('❌ Error de registro:', errorMessage);
      setError('Error al registrar usuario. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-darkBlue flex items-center justify-center">
      <div className="bg-white flex shadow-lg overflow-hidden max-w-5xl w-full mx-auto h-screen rounded-lg m-24">
        {/* Imagen */}
        <div className="w-1/2 h-full">
          <img
            alt="image"
            src="https://gcdnb.pbrd.co/images/g35QM8bbfMgA.png"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Formulario */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Register</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <label className="font-bold text-black">
                Nombre
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Número telefónico
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label className="font-bold text-black">
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Correo Electrónico"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Ciudad
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label className="font-bold text-black">
                Contraseña
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Contraseña"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Confirmar contraseña
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirmar Contraseña"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex items-start text-black">
              <input 
                type="checkbox" 
                id="terms" 
                className="mr-2 mt-1"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Al registrarte, aceptas nuestros{' '}
                <a href="#" className="text-blue-600">
                  Términos y Condiciones
                </a>{' '}
                y{' '}
                <a href="#" className="text-blue-600">
                  Política de Privacidad
                </a>
                , y autorizas recibir notificaciones sobre productos, servicios y
                promociones. Puedes darte de baja en cualquier momento.
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#6395C2] text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-600 transition duration-300"
            >
              Registrarse
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              ¿Ya tienes una cuenta?{' '}
              <Link href="./login" className="text-blue-600">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
