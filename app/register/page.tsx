import React from "react";


const Register = () => {
  return (
    <div className="min-h-screen bg-darkBlue flex items-center justify-center">
      <div className="bg-white flex  shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Imagen */}
        <div className="w-1/2" style={{ backgroundImage: "url('/path-to-your-image.png')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        
        {/* Formulario */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6">Register</h2>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <label className="font-bold">
                    Nombre
                    <input type="text" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
                </label>
                <label className="font-bold">
                    Numero telefonico
                    <input type="number" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <label className="font-bold">
                    Correo electronico
                    <input type="email" placeholder="Correo Electronico" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
                </label>
                <label className="font-bold">
                    Pais
                    <input type="text" placeholder="Ciudad" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
                </label> 
            </div>

            
            <div className="grid grid-cols-2 gap-4">
            <label className="font-bold">
                Contraseña
                <input type="password" placeholder="Contraseña" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
            </label>
            <label className="font-bold">
                Confirmar contraseña
                <input type="password" placeholder="Confirmar Contraseña" className="border border-black font-normal rounded-full  px-4 py-2 w-full" />
            </label>
              
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="terms" className="mr-2" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Al registrarte, aceptas nuestros <a href="#" className="text-blue-600">Términos y Condiciones</a> y <a href="#" className="text-blue-600">Política de Privacidad</a>, y autorizas recibir notificaciones sobre productos, servicios y promociones. Puedes darte de baja en cualquier momento.
              </label>
            </div>

            <button className="w-full bg-[#6395C2] text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-300">
              Registrarse
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              ¿Ya tienes una cuenta? <a href="#" className="text-blue-600">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
