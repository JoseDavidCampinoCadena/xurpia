import './globals.css';
import Image from 'next/image';
import React from 'react';
import { FaCubes, FaTools, FaDatabase, FaLink, FaFacebookF, FaInstagram, FaTelegram, FaDiscord } from "react-icons/fa";
import Link from 'next/link';
const features = [
  {
    icon: <FaCubes size={40} className="text-lime-400" />,
    title: "Colaboracion en Tiempo Real",
    description:
      "Nuestra IA sincroniza los cambios al instante, permitiendo que el equipo trabaje en el mismo código sin retrasos.",
  },
  {
    icon: <FaDatabase size={40} className="text-lime-400" />,
    title: "Asignacion Justa de Tareas",
    description:
      "Distribuimos las tareas de forma equilibrada, considerando habilidades, carga de trabajo y preferencias del equipo.",
  },
  {
    icon: <FaTools size={40} className="text-lime-400" />,
    title: "Solucion de Conflictos",
    description:
      "Detectamos y resolvemos conflictos de código automáticamente para mantener un flujo de trabajo continuo.",
  },
  {
    icon: <FaLink size={40} className="text-lime-400" />,
    title: "Seguridad y Privacidad Garantizadas",
    description:
      "Protegemos tu proyecto con encriptación avanzada y acceso exclusivo para miembros autorizados.",
  },
];
export default function HomePage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Mesh Gradients */}

      {/* Luces azules en los bordes */}
      <div
        className="absolute top-0 left-[-15%] w-[500px] h-[500px] blur-[140px] opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
        }}
      ></div>

<div
        className="absolute top-0 right-[-15%] w-[500px] h-[500px] blur-[140px] opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
        }}
      ></div>


      

      {/* Contenido principal */}
      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-16 py-20 gap-10 text-center md:text-left">
        {/* Texto */}
        <div className="max-w-2xl">
          <p className="text-gray-400 uppercase text-sm tracking-widest">
            ¡Alcanza tu Potencial!
          </p>
          <h2 className="text-5xl md:text-6xl text-gray-300 font-extrabold leading-tight">
            Bienvenidos a <span className="text-white">XURP</span>
            <span className="text-green-500"> IA</span>
          </h2>
          <p className="text-gray-400 mt-4">
            La mejor herramienta para la colaboración en tiempo real, asignación de tareas y resolución de conflictos en proyectos de programación.
          </p>
          <Link href="/register">
            <button className="mt-6 bg-green-500 text-black px-6 py-3 text-lg font-bold rounded-full hover:bg-green-600 transition">
              Explorar
            </button>
          </Link>

        </div>

        {/* Imagen */}
        <div className="max-w-[500px] md:max-w-[600px]">
          <Image
            src="/images/icon.png"
            alt="XURP IA Interface"
            className="w-full h-auto"
            width={650}
            height={650}
            priority
          />
        </div>
      </section>


      {/* Sección de características */}
      <section className="bg-black text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold">
            Conoce a Xurp <span className="text-green-500">IA</span> y sus beneficios
          </h2>
          <p className="text-gray-400 mt-4">
            XURP IA es una plataforma que facilita la colaboración eficiente en el mismo código, permitiendo a los equipos trabajar con equidad y transparencia.
          </p>

          <div className="py-24 flex items-center justify-center bg-black px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16  max-w-5xl">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#111] p-10 w-[450px] rounded-3xl shadow-lg text-white flex flex-col space-y-6"
                >
                  <div>{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-400 text-md">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Sección de planes */}
      <section className="bg-black text-white ">
      <div className=" text-white py-16 px-6 flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-12">Selecciona tu Plan</h2>
      <div className="flex flex-col md:flex-row gap-10">
        {/* Plan Gratis */}
        <div className="bg-black p-8 rounded-2xl shadow-lg w-80 text-center border border-white">
          <h3 className="text-3xl font-semibold">Gratis</h3>
          <p className="text-2xl font-bold mt-2 text-gray-300">$0 COP/mes</p>
          <button className="bg-gray-500 text-white py-3 px-6 rounded-lg text-lg font-semibold mt-4 cursor-default">
            Plan Actual
          </button>
          <ul className="mt-6 space-y-3 text-gray-400 text-lg">
            <li>✅ Asignación de roles y tareas</li>
            <li>✅ Acceso a creación y gestión de un proyeto</li>
            <li>✅ Visualización de calendario de tareas</li>
          </ul>
        </div>

        {/* Plan Pro */}
        <div className="bg-black p-8 rounded-2xl shadow-lg w-80 text-center border border-white">
          <h3 className="text-3xl font-semibold">Pro</h3>
          <p className="text-2xl font-bold mt-2 text-gray-300">30.000 COP/mes</p>
          <button className="bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold mt-4 hover:bg-green-600 transition">
            Adquiere tu Plan
          </button>
          <ul className="mt-6 space-y-3 text-gray-400 text-lg">
            <li>✅ Todo lo incluido en la versión gratuita</li>
            <li>✅ Asistente de IA para mejores prácticas</li>
            <li>✅ Análisis detallado de plazos y eficiencia</li>
            <li>✅ Reportes de progreso detallados</li>
          </ul>
        </div>

        {/* Plan Empresarial */}
        <div className="bg-black p-8 rounded-2xl shadow-lg w-80 text-center border border-white">
          <h3 className="text-3xl font-semibold">Empresarial</h3>
          <p className="text-2xl font-bold mt-2 text-gray-300">120.000 COP/mes</p>
          <button className="bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold mt-4 hover:bg-green-600 transition">
            Adquiere tu Plan
          </button>
          <ul className="mt-6 space-y-3 text-gray-400 text-lg">
            <li>✅ Todo lo incluido en la versión Pro</li>
            <li>✅ Herramientas avanzadas de análisis de datos</li>
            <li>✅ Soporte técnico prioritario</li>
            <li>✅ Paneles de control personalizables</li>
          </ul>
        </div>
      </div>
    </div>
      </section>

      <footer className="bg-black text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between">
          {/* Logo y texto */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <h2 className="text-2xl font-bold tracking-wide">XurpIa</h2>
            <p className="text-gray-400 text-sm">Xurp IA® potencializando los equipos</p>
          </div>

          {/* Redes sociales */}
          <div className="flex space-x-6 mt-6 md:mt-0">
            <FaFacebookF className="text-white text-lg cursor-pointer hover:opacity-80" />
            <FaTelegram className="text-white text-lg cursor-pointer hover:opacity-80" />
            <FaInstagram className="text-white text-lg cursor-pointer hover:opacity-80" />
            <FaDiscord className="text-white text-lg cursor-pointer hover:opacity-80" />
          </div>

          {/* Información y botón */}
          <div className="flex flex-col items-center md:items-end space-y-2 mt-6 md:mt-0">
            <p className="text-gray-400 text-sm">
              Todos los derechos reservados © 2025 <span className="mx-2">|</span> Políticas de Privacidad
            </p>
            <p className="text-gray-400 text-sm">
              Para contacto: <span className="text-white">xurpia.co@gmail.com</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
