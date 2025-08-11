"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSidebar } from "@/context/useSidebarContext";
import { signOut, useSession } from "next-auth/react";
import { sidebarMenu } from "@/constant/menu";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { isOpen } = useSidebar();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ x: -250, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -250, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed md:relative top-0 left-0 z-100 pointer-events-auto w-74 h-full bg-gradient-to-b from-indigo-600 to-purple-600 text-white flex flex-col p-6 shadow-lg"
                >
                    <h1 className="text-2xl font-bold mb-8">
                        { process.env.NEXT_PUBLIC_APP_NAME }
                    </h1>
                    <nav className="flex flex-col gap-4 flex-grow">
                        {sidebarMenu.map(({ label, icon: Icon, href }) => {

                            if(session?.user?.name === "admin" && href === "/personel") {
                                return (
                                    <Link
                                        key={label}
                                        href={href}
                                        className={cn(
                                            "items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors flex",
                                            href === pathname ? "bg-white/20" : ""
                                        )}
                                    >
                                        <Icon />
                                        <span className="text-lg">{label}</span>
                                    </Link>
                                )
                            } else if (href !== "/personel") {
                                return (
                                    <Link
                                        key={label}
                                        href={href}
                                        className={cn(
                                            "items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors",
                                            href === "/cetak-laporan" ? "hidden md:flex" : "flex",
                                            href === pathname ? "bg-white/20" : ""
                                        )}
                                    >
                                        <Icon />
                                        <span className="text-lg">{label}</span>
                                    </Link>
                                )
                            }
                    })}
                    </nav>
                    <Link href="#" onClick={() => signOut()} className="mt-auto flex items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors">
                        <LogOut size={20} />
                        <span className="text-lg">Logout</span>
                    </Link>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
