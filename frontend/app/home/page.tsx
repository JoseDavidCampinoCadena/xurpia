'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <div className={`font-albert container mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-4 mb-5">
        <div className={`font-bold search flex w-[400px] p-4 rounded-xl ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bx-search text-xl mr-4" />
          <input
            type="text"
            placeholder="Buscar por trabajos o compañias"
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div className={`font-bold city flex w-[400px] items-center p-4 rounded-xl ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bxs-location-plus text-xl mr-4" />
          <input
            type="text"
            placeholder="Ingresa ciudad, estado, o región"
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <button className="font-bold bg-green-500 text-white py-4 px-8 rounded-xl hover:bg-green-600">
          Buscar
        </button>
      </div>

      <div className="main">
        <div className="content mt-20">
          <div className="header mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Grupos
                </h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Aquí estarán tus grupos de trabajo
                </p>
              </div>
              <Link href="/AddProject">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Proyecto
                </button>
              </Link>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`rounded-lg shadow-sm p-6 ${
                theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-12 w-12" src="heeq-logo.png" alt="Logo de Heeq" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-bold">Heeq</h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Última conexión hace 2h
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cali, Colombia
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cantidad de integrantes: 10
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  Heeq es una empresa de tecnología que ofrece soluciones de software y hardware, donde trabajamos para darte un excelente servicio y amabilidad al cliente.
                </p>
                <button className={`mt-4 font-bold py-2 px-4 rounded transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}