"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSidebar } from "@/context/useSidebarContext";
import { signOut, useSession } from "next-auth/react";
import { sidebarMenu } from "@/constant/menu";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FaAsterisk, FaEye, FaEyeSlash, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { Modal } from "../custom/modal";
import { useCustomMutation } from "@/hooks/useQueryData";
import { UPDATE_PASSWORD } from "@/constant/key";
import { toast } from "sonner";
import { Label } from "../custom/form/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { isOpen } = useSidebar();

    const [open, setOpen] = useState<boolean>(false)

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
                    <Modal
                        title="Ganti Password"
                        open={open}
                        onOpenChange={setOpen}
                        trigger={
                            <Link href="#" className="mt-auto flex items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors">
                                <FaAsterisk size={20} />
                                <span className="text-lg">Ganti Password</span>
                            </Link>
                        }
                        content={<ContentChangePassword onClose={() => setOpen(false)} />}
                    />
                    <Link href="#" onClick={() => signOut()} className="mt-auto flex items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors">
                        <LogOut size={20} />
                        <span className="text-lg">Keluar</span>
                    </Link>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

function ContentChangePassword ({ onClose }: { onClose: React.Dispatch<React.SetStateAction<boolean>> }): React.JSX.Element {
    const { data: session } = useSession()
    const [oldPassword, setOldPassword] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [showPassword, setShowPassword] = useState<{ oldPassword: boolean; password: boolean; confirmPassword: boolean }>({ oldPassword: false, password: false, confirmPassword: false })

    const id = session?.user.id as string

    const { mutate, isPending } = useCustomMutation({
        mutationKey: [UPDATE_PASSWORD, id, password],
        params: {
            action: "UPDATE",
            id,
            updateData: {
                password,
                oldPassword
            }
        },
        url: "/api/user",
        callbackResult: (res) => {
            if(res.content) {
                onClose(false);
            }

            return res;
        }
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(confirmPassword !== password) {
            toast.warning("Password baru dan konfirmasi password tidak sama.")
            return
        }

        mutate({})
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-4">
                <Label value="Password Lama" isRequired />
                <div className="relative">
                    <Input
                        type={showPassword.oldPassword ? "text" : "password"}
                        placeholder="Masukkan password lama ..."
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        value={oldPassword}
                    />
                    <div className="absolute right-2.5 top-2 cursor-pointer" onClick={() => setShowPassword(prev => ({...prev, oldPassword: !prev.oldPassword}))}>
                        {
                            showPassword.oldPassword ? <FaEyeSlash /> : <FaEye />
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 mb-4">
                <Label value="Password Baru" isRequired />
                <div className="relative">
                    <Input
                        type={showPassword.password ? "text" : "password"}
                        placeholder="Masukkan password baru ..."
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        value={password}
                    />
                    <div className="absolute right-2.5 top-2 cursor-pointer" onClick={() => setShowPassword(prev => ({...prev, password: !prev.password}))}>
                        {
                            showPassword.password ? <FaEyeSlash /> : <FaEye />
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 mb-4">
                <Label value="Konfirmasi Password" isRequired />
                <div className="relative">
                    <Input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        placeholder="Masukkan ulang password baru ..."
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        value={confirmPassword}
                    />
                    <div className="absolute right-2.5 top-2 cursor-pointer" onClick={() => setShowPassword(prev => ({...prev, confirmPassword: !prev.confirmPassword}))}>
                        {
                            showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />
                        }
                    </div>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>{
                isPending ? <><FaSpinner className="animate-spin" />Processing ...</> : <><FaPaperPlane />Submit</> 
            }</Button>
        </form>
    )
}