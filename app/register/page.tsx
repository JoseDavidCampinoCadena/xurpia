import React from "react";
import  Link  from "next/link"

const Register = () => {
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

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <label className="font-bold text-black">
                Nombre
                <input
                  type="text"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Número telefónico
                <input
                  type="number"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label className="font-bold text-black">
                Correo electrónico
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Ciudad
                <input
                  type="text"
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
                  placeholder="Contraseña"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="font-bold text-black">
                Confirmar contraseña
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div className="flex items-start text-black">
              <input type="checkbox" id="terms" className="mr-2 mt-1" />
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

            <button className="w-full bg-[#6395C2] text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-600 transition duration-300">
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
