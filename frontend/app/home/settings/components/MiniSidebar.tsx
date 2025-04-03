import React from "react";
import Link from "next/link";
import { FaUser, FaBell, FaLock } from "react-icons/fa";

const MiniSidebar = () => {
  return (
    <aside className="w-12 h-12 mr-8 ml-12 mt-20 text-white flex flex-col items-center py-4 space-y-6 rounded-r-2xl shadow-lg">
      <Link href="/home/settings/profile">
        <div className="p-3 rounded-lg hover:bg-[#26D07C] transition cursor-pointer">
          <FaUser size={20} />
        </div>
      </Link>

      <Link href="/home/settings/notifications">
        <div className="p-3 rounded-lg hover:bg-[#26D07C] transition cursor-pointer">
          <FaBell size={20} />
        </div>
      </Link>

      <Link href="/home/settings/security">
        <div className="p-3 rounded-lg hover:bg-[#26D07C] transition cursor-pointer">
          <FaLock size={20} />
        </div>
      </Link>
    </aside>
  );
};

export default MiniSidebar;
