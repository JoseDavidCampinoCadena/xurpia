import './globals.css'
import Image from 'next/image';
import React from 'react';

export default function HomePage() {
  const items = ['CREA', 'COMPARTE', 'IA', 'ASIGNA', 'VISUALIZA', 'PROGRAMA'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600 text-white">
      
      <section className="relative min-h-screen w-full overflow-hidden">
      {/* Stars effect overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px] opacity-10"></div>
      
      {/* Content container */}
      <main className="text-center px-8 py-12">
          <h2 className="text-6xl font-extrabold leading-tight mb-6">
            Bienvenido a <br />
            <span className="text-green-500">Xurp IA</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Potenciando la colaboración en equipo
          </p>
          
          <button className="bg-green-500 text-black px-3 py-2 text-sm font-bold rounded hover:bg-green-600">
            Empezar
          </button>
        </main>

        {/* Laptops mockup */}
        <div className="relative mx-auto max-w-5xl">
          {/* First laptop */}
          <div className="absolute right-[8%] top-0 w-[45%] z-10">
            <div className="aspect-[16/10] w-full rounded-lg">
              <Image 
                src="/images/pcUno.png"
                alt="XURP IA Interface First View"
                className="h-full w-full rounded-lg object-cover"
                width={640}
                height={400}
                priority
              />
            </div>
          </div>
        
          {/* Second laptop */}
          <div className="absolute right-[35%] top-0 w-[45%] z-0">
            <div className="aspect-[16/10] w-full rounded-lg">
              <Image
                src="/images/pcdos.png"
                alt="XURP IA Interface Second View"
                className="h-full w-full rounded-lg object-cover"
                width={640}
                height={400}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Carousel Section */}
      <section className="py-12 overflow-hidden">
        <div className="relative w-full bg-opacity-20 backdrop-blur-sm bg-black">
          <div className="flex">
            <div className="animate-infinite-scroll flex whitespace-nowrap">
              {[...Array(4)].map((_, groupIndex) => (
                <div key={`group-${groupIndex}`} className="inline-flex">
                  {items.map((item, index) => (
                    <div
                      key={`item-${groupIndex}-${index}`}
                      className="inline-flex px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:text-green-400"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
