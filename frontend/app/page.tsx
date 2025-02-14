import './globals.css';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const items = ['CREA', 'COMPARTE', 'IA', 'ASIGNA', 'VISUALIZA', 'PROGRAMA'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600 text-white">
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Stars effect overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px] opacity-10"></div>

        {/* Content container */}
        <main className="text-center px-8 py-16">
          <h2 className="text-6xl font-extrabold leading-tight mb-6">
            Bienvenido a <br />
            <span className="text-green-500">Xurp IA</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Potenciando la colaboración en equipo
          </p>

          <Link href="/login">
            <button className="bg-green-500 text-black px-3 py-2 text-sm font-bold rounded cursor-pointer hover:bg-green-600">
              Empezar
            </button>
          </Link>
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
      <section className="py-2 overflow-hidden">
        <div className="relative w-full bg-opacity-20 backdrop-blur-sm bg-black">
          <div className="flex">
            <div className="animate-infinite-scroll flex whitespace-nowrap">
              {[...Array(4)].map((_, groupIndex) => (
                <div key={`group-${groupIndex}`} className="inline-flex">
                  {items.map((item, index) => (
                    <div
                      key={`item-${groupIndex}-${index}`}
                      className="inline-flex px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:text-green-400 cursor-auto"
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-darkBlue p-4 space-y-10">
          <div className="bg-[#112b50] w-full max-w-5xl p-6 md:p-10 rounded-xl shadow-lg flex flex-col md:flex-row items-center">
            <div className="image-container flex-shrink-0 mb-6 md:mb-0">
              <img
                src="https://acortar.link/rlduZU"
                alt="Equipo programando"
                className="rounded-lg w-full md:w-[496px] h-auto object-cover"
              />
            </div>
            <div className="content text-left md:ml-8">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8">
                PROGRAMACIÓN EN EQUIPO
              </h2>
              <p className="text-base md:text-lg mt-4 md:mt-8">
                XURP IA es una plataforma que facilita la colaboración eficiente
                en el mismo código, permitiendo a los equipos trabajar con
                equidad y transparencia.
              </p>
            </div>
          </div>

          <section id="services">
            <div className="bg-[#0b1e3c] text-white font-sans text-center rounded-xl flex items-center justify-center">
              <div className="container mx-auto bg-[#112b50] p-8 rounded-lg shadow-lg">
                <h1 className="uppercase font-bold text-4xl italic relative inline-block px-10 py-2 text-white">
                  ¿Qué ofrecemos?
                  <span className="absolute top-1/2 left-0 md:left-[-320px] w-full md:w-[87%] h-[4px] bg-white transform -translate-y-1/2"></span>
                  <span className="absolute top-1/2 right-0 md:right-[-320px] w-full md:w-[87%] h-[4px] bg-white transform -translate-y-1/2"></span>
                </h1>
                <div className="content flex flex-wrap justify-between mt-8">
                  <div className="box w-full md:w-[45%] bg-[#0d2747] p-6 rounded-lg mb-4 md:mb-0 text-justify">
                    <p className="mb-4">
                      <strong>1. Colaboración en Tiempo Real</strong>
                      <br />
                      Nuestra IA sincroniza los cambios al instante, permitiendo
                      que el equipo trabaje en el mismo código sin retrasos ni
                      conflictos.
                    </p>
                    <p className="mb-4">
                      <strong>2. Asignación Justa de Tareas</strong>
                      <br />
                      Distribuimos las tareas de forma equilibrada, considerando
                      habilidades, carga de trabajo y preferencias del equipo.
                    </p>
                    <p>
                      <strong>3. Solución de Conflictos de Código</strong>
                      <br />
                      Detectamos y resolvemos conflictos de código
                      automáticamente para mantener un flujo de trabajo continuo
                      y sin interrupciones.
                    </p>
                  </div>
                  <div className="box w-full md:w-[45%] bg-[#0d2747] p-6 rounded-lg text-justify">
                    <p className="mb-4">
                      <strong>4. Asistencia Técnica Personalizada</strong>
                      <br />
                      Nuestra IA ofrece soporte técnico, responde preguntas y
                      guía al equipo en mejores prácticas de programación.
                    </p>
                    <p className="mb-4">
                      <strong>5. Seguridad y Privacidad Garantizadas</strong>
                      <br />
                      Protegemos tu proyecto con encriptación avanzada y acceso
                      exclusivo para miembros autorizados.
                    </p>
                    <div className="image-container flex justify-center mt-4">
                      <img
                        src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/6641da5484ffb72b9ad73f01_Clyde.webp"
                        alt="Robot IA"
                        className="w-[150px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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