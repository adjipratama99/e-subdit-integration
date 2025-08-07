"use client"

import { AbsensiType } from "@/types/general";
import React, { forwardRef } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";

type Props = {
    data: AbsensiType[];
    date: Date;
};

const RenderPrintPreviewAbsensi = forwardRef<HTMLDivElement, Props>(({ data, date }, ref) => {

    return (
        <div className="flex justify-center w-full my-[40px]">
            <div className="w-[calc(100%-80px)] bg-white shadow-lg p-4 h-full" ref={ref}>
                <div className="ml-14 flex justify-left mb-10">
                    <div className="text-center">
                        <div>BADAN RESERSE KRIMINAL POLRI</div>
                        <div className="underline">DIREKTORAT TINDAK PIDANA EKONOMI DAN KHUSUS</div>
                    </div>
                </div>
                <div className="font-bold uppercase text-center text-[14px] mb-2">
                    <h1>ABSENSI / DAFTAR HADIR SUBDIT 1 INDAG</h1>
                    <h1 className="underline">PADA HARI SELASA TANGGAL { formatInTimeZone(date, 'UTC', 'dd MMMM yyyy', { locale: id }) }</h1>
                </div>
                <table className="w-full text-[14px]">
                    <thead>
                        <tr className="text-[12px]" style={{ backgroundColor: "#fee685" }}>
                            <th className="border w-[60px] text-center">No</th>
                            <th className="border text-center">NAMA</th>
                            <th className="border text-center">PANGKAT / NRP</th>
                            <th className="border text-center">JABATAN</th>
                            <th className="border text-center" colSpan={2}>JAM KEHADIRAN</th>
                            <th className="border text-center" colSpan={2}>TANDA TANGAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={4} className="border"></td>
                            <td className="border text-center font-bold">DATANG</td>
                            <td className="border text-center font-bold">PULANG</td>
                            <td className="border text-center font-bold">DATANG</td>
                            <td className="border text-center font-bold">PULANG</td>
                        </tr>
                        {
                            data.map((value, index) => (
                                <tr key={value.id} className="text-center">
                                    <td className="border px-[10px]">{ index + 1 }</td>
                                    <td className="border px-[10px]">{ value.personel.nama }</td>
                                    <td className="border px-[10px]">{ value.personel.pangkat }<br />{ value.personel.nrp }</td>
                                    <td className="border px-[10px]">{ value.personel.jabatan }</td>
                                    <td className="border px-[10px]">{ formatInTimeZone(value.jam_datang, 'UTC', 'yyyy-MM-dd') }<br />{ formatInTimeZone(value.jam_datang, 'UTC', 'HH:mm') }</td>
                                    <td className="border px-[10px]">{ formatInTimeZone(value.jam_pulang, 'UTC', 'yyyy-MM-dd') }<br />{ formatInTimeZone(value.jam_pulang, 'UTC', 'HH:mm') }</td>
                                    <td className="border px-[10px]"></td>
                                    <td className="border px-[10px]"></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
})

export default RenderPrintPreviewAbsensi