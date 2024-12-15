import Link from 'next/link'
import '../app/globals.css'

export default function Navbar (){
    return (
        <div>
          <header className="flex justify-between items-center px-6 py-4 bg-[#011021] text-white">
        <h1 className="text-2xl font-bold">
          <span className="text-white">XURP</span>{" "}
          <span className="bg-green-500 text-black px-2 py-1 rounded">IA</span>
        </h1>
        <nav className='flex justify-between pl-20 items-center'>
          <ul className='flex gap-4'>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
          </ul>
        </nav>
        <div className="space-x-4">
          <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
            Registrarse
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
            Ingresar
          </button>
        </div>
      </header>
            
        </div>
        
    )
}
