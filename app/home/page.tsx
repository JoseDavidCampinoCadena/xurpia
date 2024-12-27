import React from 'react';
import Link from 'next/link';


export default function Home() {
  return (
  
      <div className="font-albert container mx-auto text-white p-6">
        <div className="input-buscar nav flex items-center justify-between mb-5">
          <div className="font-bold search flex w-full max-w-lg bg-[#343434] p-4 rounded-xl mr-3">
            <i className="bx bx-search text-xl mr-4" />
            <input
              type="text"
              placeholder="Buscar por trabajos o compañias"
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <div className="font-bold city flex w-full max-w-lg items-center bg-[#343434] p-4 rounded-xl ml-5 mr-2">
            <i className="bx bxs-location-plus text-xl mr-5" />
            <input
              type="text"
              placeholder="Ingresa ciudad, estado, o región"
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <button className="font-bold ml-13 mr-12 bg-[#000000] py-4 px-6 rounded-xl hover:bg-[#4ade80]">
            Buscar
          </button>
        </div>

        <div className="main">
          <div className="content mt-20">
            <div className="header mb-4">
              <h4 className="text-2xl font-bold">Grupos</h4>
              <p className="text-gray-400">Aquí estarán tus grupos de trabajo</p>
              <div className="flex justify-end p-2z">
                <Link href="/AddProject">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
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
                <div className="bg-[#343434] text-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-12 w-12" src="heeq-logo.png" alt="Logo de Heeq" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-bold">Heeq</h2>
                      <p className="text-sm">Última conexión hace 2h</p>
                      <p className="text-sm">Cali, Colombia</p>
                      <p className="text-sm">Cantidad de integrantes: 10</p>
                    </div>
                  </div>
                  <p className="mt-4">Heeq es una empresa de tecnología que ofrece soluciones de software y hardware, donde trabajamos para darte un excelente servicio y amabilidad al cliente.</p>
                  <button className="bg-[#5a5757] text-white font-bold py-2 px-4 rounded mt-4">
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