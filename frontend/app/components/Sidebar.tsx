import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="p-6">
        <Link href="/home" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600 dark:text-green-500">XURP IA</span>
        </Link>
        
        <nav className="mt-8">
          {/* Similar al AdminSidebar */}
        </nav>
      </div>
    </aside>
  );
}