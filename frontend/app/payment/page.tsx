'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const countriesData: { [key: string]: string[] } = {
  Colombia: ["Antioquia", "Cundinamarca", "Valle del Cauca", "Santander", "Atlántico"],
  Argentina: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán"],
  Mexico: ["Ciudad de México", "Jalisco", "Nuevo León", "Puebla", "Guanajuato"],
  USA: ["California", "Texas", "Florida", "New York", "Illinois"],
  España: ["Madrid", "Cataluña", "Andalucía", "Valencia", "Galicia"]
};

export default function PaymentPage() {
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Colombia');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedDepartment(''); // Resetea departamento al cambiar país
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-100 to-gray-300 text-black">
      {/* Left Section */}
      <div className="md:w-1/2 p-10 flex flex-col justify-center space-y-6">
        <Link href="/" className="text-green-500 hover:underline">← Regresar</Link>
        <div className="text-3xl font-bold text-green-700">Xurp Ia</div>
        <h2 className="text-2xl font-semibold">Suscríbete a Xurp Ia Pro</h2>
        <p className="text-4xl font-extrabold text-green-700">COP 30.000 <span className="text-base font-medium text-black">/ mes</span></p>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span>Suscripción Pro</span>
            <span>COP 30.000</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>COP 30.000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                IVA
                <span className="text-gray-400 cursor-pointer" title="Tax info">ⓘ</span>
              </span>
              <span>COP 5.000</span>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>COP 35.000</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 p-10 bg-white rounded-lg shadow-lg flex flex-col justify-center">
        <form className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Tu correo electrónico" required />
          </div>

          {/* Payment method */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Método de pago</h3>
            <div className="space-y-4">
              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Número de tarjeta" required />
              <div className="flex gap-4">
                <input
                  type="text"
                  className="w-1/2 border rounded-md p-3 bg-white text-black"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => {
                    let input = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
                    if (input.length >= 3) {
                      input = input.slice(0, 2) + '/' + input.slice(2, 4);
                    }
                    setExpiry(input);
                  }}
                  maxLength={5}
                  required
                />
                <input
                  type="text"
                  className="w-1/2 border rounded-md p-3 bg-white text-black"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, ''); // Solo números
                    if (input.length <= 3) {
                      setCvc(input);
                    }
                  }}
                  maxLength={3}
                  required
                />
              </div>
              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Nombre completo" required />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Dirección de facturación</h3>
            <div className="space-y-4">
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full border rounded-md p-3 bg-white text-black"
              >
                {Object.keys(countriesData).map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Dirección (línea 1)" required />
              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Suburbio o barrio" />

              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Ciudad" required />

              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full border rounded-md p-3 bg-white text-black"
                required
              >
                <option value="">Selecciona un departamento</option>
                {countriesData[selectedCountry].map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <input type="text" className="w-full border rounded-md p-3 bg-white text-black" placeholder="Código postal" required />
            </div>
          </div>

          {/* Save Info */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="save-info" className="h-5 w-5" />
            <label htmlFor="save-info" className="text-sm">Guardar mi información para próximas compras</label>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 leading-5">
            Al suscribirte aceptas nuestros Términos de uso y Política de privacidad. Podrás cancelar en cualquier momento.
          </p>

          {/* Submit Button */}
          <Link href="/register">
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition">Suscribirme</button>
          </Link>
          
        </form>
      </div>
    </div>
  );
}
