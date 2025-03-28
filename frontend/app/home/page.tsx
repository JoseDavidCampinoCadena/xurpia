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
            </div>
          </div>

          <p>ACA SE PONE EL PROYECTO QUE CREA EL USUARIO</p>



        </div>
      </div>
    </div>
  );
}