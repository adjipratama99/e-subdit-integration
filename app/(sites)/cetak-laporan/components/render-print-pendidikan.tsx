"use client"

import { Personel } from "@/types/general";
import { formatInTimeZone } from "date-fns-tz";
import React, { forwardRef, useMemo } from "react";
import { id } from "date-fns/locale";
import { cn, groupByKey } from "@/lib/utils";

type Props = {
    data: Personel[];
};

const RenderPrintPreviewPendidikan = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    const personel = useMemo(() => {
        return data.map(person => {
            const { pendidikan, ...personWithoutPendidikan } = person;
            return {
                ...personWithoutPendidikan,
                ...groupByKey(pendidikan, "jenis")
            }
        })
    }, [data])

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
                    <h1 className="underline">DATA PERSONEL PENDIDIKAN KEPOLISIAN, UMUM DAN KEJURUAN</h1>
                    <h1>SUBDIT I DITTIPIDEKSUS</h1>
                </div>
                <table className="w-full text-[14px]">
                    <thead>
                        <tr className="text-[12px]" style={{ backgroundColor: "#fee685" }}>
                            <th className="border w-[60px] text-center">No</th>
                            <th className="border text-center w-[150px]">NAMA</th>
                            <th className="border text-center">PANGKAT / NRP</th>
                            <th className="border text-center">JABATAN</th>
                            <th className="border text-center w-[100px]">PENDIDIKAN UMUM</th>
                            <th className="border text-center w-[100px]">PENDIDIKAN KEPOLISIAN</th>
                            <th className="border text-center w-[150px]">PENDIDIKAN KEJURUAN</th>
                            <th className="border text-center">PENDIDIK / PENYIDIK PEMBANTU</th>
                            <th className="border text-center">ADA / TIDAK ADA SKEP</th>
                            <th className="border text-center">SERTIFIKASI / TIDAK SERTIFIKASI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            personel.map((value, index) => (
                                <tr key={value.id} className={cn(
                                    "align-top text-center text-[10px]",
                                    (index + 1) % 5 === 0 ? "page-break-avoid" : ""
                                )}>
                                    <td className="border px-[10px]">{ index + 1 }</td>
                                    <td className="border px-[10px]">{ value.nama }</td>
                                    <td className="border px-[10px]">{ value.pangkat }<br />{ value.nrp }</td>
                                    <td className="border px-[10px]">{ value.jabatan }</td>
                                    <td className="border px-[10px]">
                                        
                                            { value.umum!.map(umum => (
                                                <div className="grid grid-cols-2" key={umum.nama_sekolah}>
                                                    <div>{ umum.nama_sekolah }</div>
                                                    <div>{ umum.tahun_mulai }</div>
                                                </div>
                                            )) }
                                    </td>
                                    <td className="border px-[10px] text-left">
                                        <ul>
                                                { value.kepolisian!.map(kepolisian => (
                                                        <li className="list-disc ml-4" key={kepolisian.nama_sekolah}>{ kepolisian.nama_sekolah } { kepolisian.tahun_mulai }</li>
                                                )) }
                                        </ul>
                                    </td>
                                    <td className="border px-[10px] text-left">
                                        <ul>
                                                { value.kejuruan!.map(kejuruan => (
                                                        <li className="list-disc ml-4" key={kejuruan.nama_sekolah}>{ kejuruan.nama_sekolah } { kejuruan.tahun_mulai }</li>
                                                )) }
                                        </ul>
                                    </td>
                                    <td className="border px-[10px]">{ value.is_detective ? "PENYIDIK" : "PEMBANTU PENYIDIK" }</td>
                                    <td className="border px-[10px]">{ value.skep }</td>
                                    <td className="border px-[10px]">{ value.certified ? "SUDAH" : "" }</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
})

export default RenderPrintPreviewPendidikan