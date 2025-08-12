"use client";

import { useSidebar } from "@/context/useSidebarContext";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";

export default function Topbar() {
    const { toggle, isOpen } = useSidebar();
    const { data: session } = useSession()
    const pathname = usePathname().split('/')[1].split('-').join(' ')

    return (
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
            <div className="flex items-center gap-2">
                <Link
                    href="#"
                    onClick={toggle}
                    className={cn(
                        "p-2 rounded hover:bg-gray-100 transition text-black",
                        isOpen && "ml-70 md:ml-0"
                    )}
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold hidden md:block capitalize">
                    { pathname }
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Tambah konten kanan, contoh: notif/user */}
                <div className="text-sm font-medium text-gray-700">Hello, <span className="capitalize">{ session?.user.name }</span>!</div>
                <Link
                    href="#"
                    onClick={() => signOut()}
                    className="text-red-500"
                ><FaSignOutAlt /></Link>
            </div>
        </header>
    );
}
