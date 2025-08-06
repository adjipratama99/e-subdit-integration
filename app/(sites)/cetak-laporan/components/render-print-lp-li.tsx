"use client"

import { Penanganan } from "@/types/general";
import { formatInTimeZone } from "date-fns-tz";
import React, { forwardRef } from "react";
import { id } from "date-fns/locale";

type Props = {
    data: Penanganan[];
};

const RenderPrintPreviewLPLI = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    return (
        <div className="flex justify-center w-full my-[40px]">
            <div className="w-[calc(100%-80px)] bg-white shadow-lg p-4 h-full" ref={ref}>
                <div className="font-bold uppercase text-center text-[18px] mb-2">
                    <h1>MATRIKS PENANGANAN LAPORAN POLISI</h1>
                    <h1>UNIT II SUBDIT I DITTIPIDEKSUS BARESKRIM POLRI</h1>
                </div>
                <table className="w-full text-[14px]">
                    <thead>
                        <tr>
                            <th className="border w-[60px]">No</th>
                            <th className="border">LAPORAN POLISI</th>
                            <th className="border w-[400px]">URAIAN</th>
                            <th className="border">HAMBATAN</th>
                            <th className="border">RTL</th>
                            <th className="border">PERKEMBANGAN / KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((value, index) => (
                                <tr key={value.id} className="align-top page-break-avoid">
                                    <td className="border text-center">{ index + 1 }</td>
                                    <td className="border break-all text-[12px] px-[10px] text-justify">
                                        <div className="mb-2">
                                            { value.nomor }, tanggal { formatInTimeZone(value.tanggal, 'UTC', 'dd MMMM yyyy', { locale: id }) }
                                        </div>
                                        <div>({ value.judul })</div>
                                    </td>
                                    <td className="border text-[12px]">
                                        <div className="mb-4 px-[10px]">
                                            <div>Kronologis:</div>
                                            <div className="text-justify">{ value.kronologis }</div>
                                        </div>
                                        <div className="mb-4 px-[10px]">
                                            <div>Persangkaan Pasal:</div>
                                            <div className="text-justify flex">
                                                { value.pasal.map((pasal, ind) => {
                                                    if(ind !== (value.pasal.length - 1)) {
                                                        return `${ pasal }${ ind !== (value.pasal.length - 2) ? ', ' : '' } `
                                                    } else {
                                                        return ` dan ${ pasal }`
                                                    }
                                                }) }
                                            </div>
                                        </div>
                                        <div className="mb-4 px-[10px]">
                                            <div>Terlapor:</div>
                                            <ul className="text-justify ml-4">
                                                { value.terlapor.map(terlapor => <li className="list-decimal" key={terlapor}>{terlapor}</li>) }
                                            </ul>
                                        </div>
                                        <div className="mb-4 px-[10px]">
                                            <div>Pelapor:</div>
                                            <ul className="text-justify ml-4">
                                                { value.pelapor.map(pelapor => <li className="list-decimal" key={pelapor}>{pelapor}</li>) }
                                            </ul>
                                        </div>
                                        <div className="mb-4 px-[10px]">
                                            <div>Saksi:</div>
                                            <ul className="text-justify ml-4">
                                                { value.saksi.map(saksi => <li className="list-decimal" key={saksi}>{saksi}</li>) }
                                            </ul>
                                        </div>
                                    </td>
                                    <td className="text-justify border px-[10px] text-[12px]">{ value.catatan_hambatan }</td>
                                    <td className="text-justify border px-[10px] text-[12px]">{ value.rtl }</td>
                                    <td className="text-justify border px-[10px] text-[12px]">{ value.keterangan }</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
})

export default RenderPrintPreviewLPLI