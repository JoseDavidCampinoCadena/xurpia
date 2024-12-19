import Image from 'next/image';
import './globals.css'


export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <section id='#Home'>
      <main className="text-center px-8 py-16">
        <h2 className="text-5xl font-extrabold leading-tight mb-6">
          Bienvenido a <br />
          <span className="text-green-500">Xurp IA</span>
        </h2>
        <p className="text-lg text-gray-400 mb-8">
          Potenciando la colaboración en equipo
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-green-500 text-black px-6 py-3 text-lg font-bold rounded hover:bg-green-600">
            Empezar
          </button>
        </div>
      </main>

      <div className='flex items-center justify-center min-h-screen bg-black -mt-20'>
    <div className='flex flex-col items-center justify-center bg-green-500 text-black p-4 w-[1000px] rounded-xl'>
        <h1 className='font-semibold text-3xl'>PROGRAMACIÓN EN EQUIPO</h1>
        <p className='text-center'>XURP IA es una plataforma que facilita la colaboración eficiente
           en el mismo código, permitiendo a los equipos trabajar con equidad y transparencia.</p>
        <img className='rounded-xl w-[600px] h-[600px] m-5' src="https://files.oaiusercontent.com/file-PpsjBcW9HfVTKMLHHuS5bQ?se=2024-12-15T18%3A50%3A36Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D786d5d1d-1282-47c1-8b88-85d32483008c.webp&sig=29sky/6ayAoDdhTZpIwOmUvGGfblC6OGSA1PD1N0ZbM%3D"/>
    </div>
</div>

      <div className="w-full overflow-x-auto">
        <ul className="flex gap-4 py-4 whitespace-nowrap">
          <li className="bg-[#212525] rounded-xl p-5 ml-2 flex-shrink-0">CREA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">COMPARTE</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">IA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">ASIGNA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">VISUALIZA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">PROGRAMA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">MEJORA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">CREA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">COMPARTE</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">IA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">ASIGNA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">VISUALIZA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">PROGRAMA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">MEJORA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">CREA</li>
          <li className="bg-[#212525] rounded-xl p-5 flex-shrink-0">COMPARTE</li>
        </ul>
      </div>

      </section>


      {/* Graphics Section */}
      <section className="relative flex justify-center items-center py-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-r from-green-500 to-yellow-500 blur-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="bg-gradient-to-br from-green-500 to-yellow-500 w-48 h-48 rounded shadow-lg"></div>
          <div className="bg-gradient-to-br from-green-500 to-yellow-500 w-48 h-48 rounded shadow-lg"></div>
          <div className="bg-gradient-to-br from-green-500 to-yellow-500 w-48 h-48 rounded shadow-lg"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-6">
        <div className="text-center text-sm">
          <p>© 2024 XURP IA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
