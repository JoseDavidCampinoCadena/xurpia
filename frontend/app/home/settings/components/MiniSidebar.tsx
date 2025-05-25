import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaBell, FaLock } from "react-icons/fa";

const MiniSidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="w-12 h-12 mr-8 ml-12 mt-20 text-white flex flex-col items-center py-4 space-y-6 rounded-r-2xl shadow-lg">
      <Link href="/home/settings/profile">
        <div
          className={`p-3 rounded-lg transition cursor-pointer ${
            pathname === "/home/settings/profile" ? "bg-[#26D07C]" : "hover:bg-[#26D07C]"
          }`}
        >
          <FaUser size={20} />
        </div>
      </Link>

      <Link href="/home/settings/notifications">
        <div
          className={`p-3 rounded-lg transition cursor-pointer ${
            pathname === "/home/settings/notifications" ? "bg-[#26D07C]" : "hover:bg-[#26D07C]"
          }`}
        >
          <FaBell size={20} />
        </div>
      </Link>

      <Link href="/home/settings/security">
        <div
          className={`p-3 rounded-lg transition cursor-pointer ${
            pathname === "/home/settings/security" ? "bg-[#26D07C]" : "hover:bg-[#26D07C]"
          }`}
        >
          <FaLock size={20} />
        </div>
      </Link>
    </aside>
  );
};

export default MiniSidebar;
