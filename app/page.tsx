
import './globals.css'
import Image from 'next/image';
import React from 'react';



export default function HomePage() {
  return (
    <div className="min-h-screen  text-white">
      
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
    <div className="absolute right-[35%] top-0 w-[45%]  z-0">
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

  {/* Button moved inside container */}
  

    </section>

      <section id='#Home'>
        

    
                    <div className="w-full overflow-hidden shadow-2xl">
            <div className="inline-flex whitespace-nowrap animate-scroll">
              {[...Array(8)].map((_, index) => ( // Increased from 4 to 8
                <React.Fragment key={`list-${index}`}>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">CREA</li>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">COMPARTE</li>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">IA</li>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">ASIGNA</li>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">VISUALIZA</li>
                  <li className="inline-flex px-4 flex-shrink-0 transition-all duration-300">PROGRAMA</li>
                </React.Fragment>
              ))}
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
