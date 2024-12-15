import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 mx-6 mt-4 bg-[#212525] backdrop-blur-md rounded-full shadow-md">
      {/* Logo */}
      <h1 className="text-xl font-bold">
        <span className="text-white">XURP</span>{' '}
        <span className="bg-black text-green-500 px-2 py-1 rounded-full">IA</span>
      </h1>

      {/* Navigation Links */}
      <ul className="flex gap-4 text-white font-medium text-sm">
        <li>
          <Link href="#Home" className="hover:text-green-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="#services" className="hover:text-green-400">
            Services
          </Link>
        </li>
        <li>
          <Link href="#contact" className="hover:text-green-400">
            Contact
          </Link>
        </li>
        <li>
          <Link href="#faq" className="hover:text-green-400">
            FAQ
          </Link>
        </li>
      </ul>

      {/* Action Buttons */}
      <div className="space-x-3">
        <button className="text-s text-white hover:text-green-400 transition">
          Registrarse
        </button>
        <button className="text-s text-green-500 px-3 py-2">
          Ingresar
        </button>
      </div>
    </nav>
  );
}
