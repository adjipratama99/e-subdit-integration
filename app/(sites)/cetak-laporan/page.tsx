"use client"

import { Label } from "@/components/custom/form/label";
import ModalTypeData from "@/components/custom/modal/data-type";
import React, { Fragment, useRef, RefObject, useState } from "react";
import 'rsuite/DateRangePicker/styles/index.css'
import { DatePicker, DateRangePicker } from "rsuite";
import { Select } from "@/components/custom/form/select";
import { JenisLPLI } from "@/constant/options";
const { allowedMaxDays } = DateRangePicker;

import {
    toggleOpen,
    changeDateRange,
    changeDate,
    changeJenis
} from "@/redux/slices/reportSlice"

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useCustomQuery } from "@/hooks/useQueryData";
import { GET_REPORT_LIST } from "@/constant/key";
import { AbsensiType, Penanganan, Personel, ResponseTableTypes, TableHeader } from "@/types/general";
import RenderPrintPreviewLPLI from "./components/render-print-lp-li";
import { usePrint } from "@/hooks/use-print";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import RenderPrintPreviewPendidikan from "./components/render-print-pendidikan";
import RenderPrintPreviewAbsensi from "./components/render-print-absensi";
import { formatInTimeZone } from "date-fns-tz";
import { usePdfGenerator } from "@/hooks/use-export-pdf";
import { generateConfigTablePdf } from "@/lib/utils";

export default function CetakLaporan(): React.JSX.Element {
    const printRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch();
    const { open, typeData, dateRange, jenis, date } = useAppSelector((state) => state.report);
    const [tableHead, setTableHead] = useState<TableHeader[][]>([])
    const [tableBody, setTableBody] = useState<any[]>([])

    const { handlePrint } = usePrint(printRef as RefObject<HTMLElement>, typeData!)
    const { generatePdf } = usePdfGenerator()
    const {
        data
    } = useCustomQuery({
        queryKey: [GET_REPORT_LIST, typeData!, jenis, dateRange.dateFrom, dateRange.dateUntil, date],
        url: `/api/${ typeData }`,
        params: {
            dateFrom: dateRange.dateFrom,
            dateUntil: dateRange.dateUntil,
            ...(jenis.length && { jenis }),
            ...(["personnel", "absensi"].includes(typeData!) && { report: true, offset: 0, limit: 9999 }),
            ...(typeData === "absensi" && { date })
        },
        makeLoading: true,
        enabled: !!typeData,
        callbackResult(res) {
            if(res.code === 0) {
                if(res.content.count) {
                    let dataReport = res.content.results
                    const { header, result } = generateConfigTablePdf(dataReport, typeData!)

                    setTableHead(header)
                    setTableBody(result)
                }
            }
            
            return res as ResponseTableTypes
        },
    })

    const handleGeneratePdf = () => {
        switch(typeData) {
            case "absensi":
                generatePdf({
                    title: `Absensi ${ formatInTimeZone(new Date(date), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    centerBody: true
                })
                break;
            case "personnel":
                generatePdf({
                    title: `PErsonnel ${ formatInTimeZone(new Date(date), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    centerBody: true
                })
                break;
            case "lp-li":
                generatePdf({
                    title: `Rekap Laporan Polisi ${ formatInTimeZone(new Date(date), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    centerBody: false
                })
                break;
        }
    }

    return (
        <Fragment>
            <div className="bg-white w-full h-full p-4">
                {
                    typeData && (
                        <Fragment>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {
                                        typeData === "lp-li" && (
                                            <Fragment>
                                                <div className="flex items-center gap-2">
                                                    <Label value="Rentang Tanggal" isRequired />
                                                    <DateRangePicker
                                                        format="yyyy-MM-dd"
                                                        cleanable={false}
                                                        shouldDisableDate={allowedMaxDays(30)}
                                                        onChange={(val) =>
                                                            dispatch(
                                                                changeDateRange({
                                                                    dateFrom: val ? val[0].toISOString() : "",
                                                                    dateUntil: val ? val[1].toISOString() : "",
                                                                })
                                                            )
                                                        }
                                                        value={[new Date(dateRange.dateFrom), new Date(dateRange.dateUntil)]}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Label value="Jenis" />
                                                        <Select
                                                            isMulti
                                                            className="z-30"
                                                            options={JenisLPLI}
                                                            onChange={(val) => dispatch(changeJenis(val as string))}
                                                            value={jenis}
                                                        />
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )
                                    }
                                    {
                                        typeData === "absensi" && (
                                            <div className="flex items-center gap-2">
                                                <Label value="Tanggal" isRequired />
                                                <DatePicker
                                                    format="yyyy-MM-dd"
                                                    className="relative z-20"
                                                    cleanable={false}
                                                    onChange={(val) =>
                                                        dispatch(
                                                            changeDate(formatInTimeZone(val as Date, 'UTC', 'yyyy-MM-dd') as string)
                                                        )
                                                    }
                                                    value={new Date(date)}
                                                />
                                            </div>
                                        )
                                    }
                                </div>
                                <Button type="button" onClick={() => dispatch(toggleOpen())}><FaFilter />Ganti Tipe Dokumen</Button>
                            </div>
                        </Fragment>
                    )
                }
                {
                    data && (
                        data.code === 0 && data.content.count ?
                        (
                            <div className="flex justify-center mt-10 h-auto">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h1 className="text-2xl">Pratinjau Cetak</h1>
                                        <div className="flex items-center gap-4">
                                            <Button type="button" onClick={handleGeneratePdf} variant="outline"><FaFilePdf />Generate PDF</Button>
                                            <Button type="button" onClick={handlePrint}><FaPrint />Cetak Dokumen</Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-[calc(100%-70px)] bg-gray-400 border h-[750px] overflow-y-scroll">
                                            { typeData === "lp-li" && (<RenderPrintPreviewLPLI data={data.content.results as Penanganan[]} ref={printRef} />) }
                                            { typeData === "personnel" && (<RenderPrintPreviewPendidikan data={data.content.results as Personel[]} ref={printRef} />) }
                                            { typeData === "absensi" && (<RenderPrintPreviewAbsensi data={data.content.results as AbsensiType[]} date={new Date(date)} ref={printRef} />) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        :
                        <div className="flex items-center justify-center h-full">
                            <h1 className="text-2xl italic text-gray-400">Data tidak ditemukan.</h1>
                        </div>
                    )
                }
            </div>
            <ModalTypeData open={open} />
        </Fragment>
    )
}