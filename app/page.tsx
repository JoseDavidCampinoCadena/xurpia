import './globals.css'
import Image  from 'next/image'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#011021] text-white">
      {/* Navbar */}
    

      {/* Hero Section */}
      <main className="flex flex-col items-center  justify-center text-center mt-24 ">
        <h2 className="text-4xl font-bold mb-4">
          Bienvenido a <span className="text-green-500">XURP IA</span>
        </h2>

        <p className="text-2xl mb-8">
          Potenciando la <span className="font-bold">Colaboración en Equipo</span>
        </p>
        {/* Image section */}
        
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