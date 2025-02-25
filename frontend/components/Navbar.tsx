import Link from "next/link";
import { FaTelegram, FaInstagram, FaXTwitter, FaDiscord } from "react-icons/fa6";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full px-6 py-4 flex justify-between items-center bg-transparent text-white z-50">
      {/* Redes sociales (izquierda) */}
      <div className="flex space-x-4 text-gray-400">
        <Link href="#" className="hover:text-white transition"><FaTelegram /></Link>
        <Link href="#" className="hover:text-white transition"><FaInstagram /></Link>
        <Link href="#" className="hover:text-white transition"><FaXTwitter /></Link>
        <Link href="#" className="hover:text-white transition"><FaDiscord /></Link>
        <Link href="/">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10  border-white rounded-full bg-transparent [box-shadow:inset_0_0_8px_10px_rgba(255,255,255,0.5)] cursor-pointer"></div>
        </Link>
      </div>

    
    

      {/* Enlaces de la derecha */}
      <div className="flex space-x-6 text-sm font-light text-gray-300">
        <Link href="/register" className="hover:text-white transition">Registrarse</Link>
        <Link href="/login" className="hover:text-white transition">Ingresar</Link>
      </div>
    </nav>
  );
}
