import './globals.css'
import Navbar from '@/components/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#011021] text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">
          <span className="text-white">XURP</span>{" "}
          <span className="bg-green-500 text-black px-2 py-1 rounded">IA</span>
        </h1>
          <Navbar></Navbar>
        <div className="space-x-4">
          <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
            Registrarse
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
            Ingresar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center mt-12 px-4">
        <h2 className="text-4xl font-bold mb-4">
          Bienvenido a <span className="text-green-500">XURP IA</span>
        </h2>

        <p className="text-2xl mb-8">
          Potenciando la <span className="font-bold">Colaboración en Equipo</span>
        </p>
        {/* Image section */}
        <div className="relative">
          <img
            src="/path-to-image.png"
            alt="Xurp IA Interface"
            className="rounded-lg shadow-lg w-3/4 mx-auto"
          />
        </div>
      </main>

      {/* CTA Section */}
      <footer className="bg-blue-900 mt-12 py-6">
        <div className="text-center">
          <a
            href="#subscribe"
            className="bg-black text-white px-8 py-4 text-lg font-bold rounded-full hover:bg-gray-800"
          >
            SUSCRÍBETE YA
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;