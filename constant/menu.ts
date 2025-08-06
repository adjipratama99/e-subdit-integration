import { BookText, HomeIcon, MessageCircleWarning, Printer, Users } from "lucide-react";

export const sidebarMenu = [
    { href: "/dashboard", icon: HomeIcon, label: "Beranda" },
    { href: "/personel", icon: Users, label: "Personel" },
    { href: "/pendidikan", icon: BookText, label: "Pendidikan" },
    { href: "/pelaporan-lp-&-li", icon: MessageCircleWarning, label: "Pelaporan LP & LI" },
    { href: "/cetak-laporan", icon: Printer, label: "Cetak Laporan" },
];
