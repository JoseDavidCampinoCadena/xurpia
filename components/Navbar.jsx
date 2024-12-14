import Link from 'next/link'

export default function Navbar (){
    return (
        <div>
            <nav className='flex justify-between pl-20 items-center'>
          <ul className='flex gap-4'>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/services">Services</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </nav>
        </div>
        
    )
}
