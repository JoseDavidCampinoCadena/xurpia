import React from 'react'
import Link from 'next/link'

const Login = () => {
  return (
    <div className='min-h-screen bg-darkBlue flex items-center justify-center'>
        <div className="bg-white flex shadow-lg overflow-hidden max-w-5xl w-full mx-auto h-screen rounded-lg m-12">
  {/* Imagen */}
  <div className="w-1/2 h-full">
    <img
      alt="image"
      src="https://gcdnb.pbrd.co/images/lAooOJQmVbOJ.jpg?o=1"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Formulario */}
  <div className="w-1/2 p-12 flex flex-col justify-center">
    <h2 className="text-3xl font-bold mb-4 text-black">Login</h2>
    <p className="text-gray-600 mb-6">
      Bienvenido de nuevo, por favor inicia sesión
    </p>

    <form className="space-y-6">
      <div>
        <label className="font-bold text-black">
          Correo Electrónico
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
      </div>
      <div>
        <label className="font-bold text-black">
          Contraseña
          <input
            type="password"
            placeholder="Contraseña"
            className="border border-gray-300 font-normal rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
      </div>

      <div className="text-right">
        <a href="#" className="text-green-500 text-sm">
          ¿Has olvidado la contraseña?
        </a>
      </div>

      <Link href="./home">
      <button className="w-full bg-green-400 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-500 transition duration-300">
        Login
      </button>
      </Link>
      

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿Necesitas una cuenta?{' '}
        <Link href="./register" className="text-green-500 font-semibold">
          Regístrate
        </Link>
      </p>
    </form>
  </div>
</div>

    </div>
  )
};

export default Login;
