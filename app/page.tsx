import Image from 'next/image';
import './globals.css'


export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
     
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
          <button className="border border-gray-500 text-white px-6 py-3 text-lg font-bold rounded hover:border-green-500">
            Suscribirse
          </button>
        </div>
      </main>

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
    
   
  </ul>
</div>


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
