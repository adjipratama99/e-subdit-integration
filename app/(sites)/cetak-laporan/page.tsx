"use client"

import { Label } from "@/components/custom/form/label";
import ModalTypeData from "@/components/custom/modal/data-type";
import React, { Fragment, useRef, RefObject, useState, useMemo } from "react";
import 'rsuite/DateRangePicker/styles/index.css'
import { DateRangePicker } from "rsuite";
import { Option, Select } from "@/components/custom/form/select";
import { JenisLPLI } from "@/constant/options";

import {
    toggleOpen,
    changeDateRange,
    changePersonel,
    changeJenis
} from "@/redux/slices/reportSlice"

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useCustomQuery } from "@/hooks/useQueryData";
import { GET_LIST_PERSONNEL, GET_REPORT_LIST } from "@/constant/key";
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
    const { open, typeData, dateRange, jenis, personel_id } = useAppSelector((state) => state.report);
    const [tableHead, setTableHead] = useState<TableHeader[][]>([])
    const [tableBody, setTableBody] = useState<any[]>([])

    const { handlePrint } = usePrint(printRef as RefObject<HTMLElement>, typeData!)
    const { generatePdf } = usePdfGenerator()
    const {
        data
    } = useCustomQuery({
        queryKey: [GET_REPORT_LIST, typeData!, jenis, dateRange.dateFrom, dateRange.dateUntil, personel_id],
        url: `/api/${ typeData }`,
        params: {
            dateFrom: dateRange.dateFrom,
            dateUntil: dateRange.dateUntil,
            ...(jenis.length && { jenis }),
            ...(["personnel", "absensi"].includes(typeData!) && { report: true, offset: 0, limit: 9999 }),
            ...(personel_id && { personel_id })
        },
        makeLoading: true,
        enabled: !!typeData,
    })

    const dataResult = useMemo(() => {
        if(data) {
            const res = data as ResponseTableTypes
            if(res.code === 0) {
                if(res.content.count) {
                    let dataReport = res.content.results
                    const { header, result } = generateConfigTablePdf(dataReport, typeData!)

                    setTableHead(header)
                    setTableBody(result)
                }
            }

            return res
        }
    }, [data])

    const {
        data: personel
    } = useCustomQuery({
        url: "/api/personnel",
        queryKey: [GET_LIST_PERSONNEL],
        params: { type: "READ", "offset": 0, "limit": 9999 },
        makeLoading: true,
        callbackResult(res) {
            let results = [] as { [key: string]: string }[];
            if(res.code === 0) {
                if(res.content.count) {
                    const dataPersonel = res.content.results as Personel[]
                    results = dataPersonel.map(personel => ({ text: personel.nama, value: personel.id }))
                }
            }

            return results;
        },
    })

    const handleGeneratePdf = () => {
        switch(typeData) {
            case "absensi":
                generatePdf({
                    title: `Absensi ${ formatInTimeZone(new Date(dateRange.dateFrom), 'UTC', 'dd MMMM yyyy') } - ${ formatInTimeZone(new Date(dateRange.dateUntil), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    dateRange,
                    centerBody: true
                })
                break;
            case "personnel":
                generatePdf({
                    title: `Personnel ${ formatInTimeZone(new Date(dateRange.dateFrom), 'UTC', 'dd MMMM yyyy') } - ${ formatInTimeZone(new Date(dateRange.dateUntil), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    dateRange,
                    centerBody: true
                })
                break;
            case "lp-li":
                generatePdf({
                    title: `Rekap Laporan Polisi ${ formatInTimeZone(new Date(dateRange.dateFrom), 'UTC', 'dd MMMM yyyy') } - ${ formatInTimeZone(new Date(dateRange.dateUntil), 'UTC', 'dd MMMM yyyy') }`,
                    tableHeaders: tableHead,
                    tableBody,
                    typeData,
                    dateRange,
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
                                            <Fragment>
                                                <DateRangePicker
                                                    format="yyyy-MM-dd"
                                                    cleanable={false}
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
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Label value="Personel" />
                                                        <Select
                                                            className="z-30"
                                                            options={personel as Option[]}
                                                            onChange={(val) => dispatch(changePersonel(val as string))}
                                                            placeholder="Pilih personel"
                                                            value={personel_id}
                                                        />
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )
                                    }
                                </div>
                                <Button type="button" onClick={() => dispatch(toggleOpen())}><FaFilter />Ganti Tipe Dokumen</Button>
                            </div>
                        </Fragment>
                    )
                }
                {
                    dataResult && (
                        dataResult.code === 0 && dataResult.content.count ?
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
                                            { typeData === "lp-li" && (<RenderPrintPreviewLPLI data={dataResult.content.results as Penanganan[]} ref={printRef} />) }
                                            { typeData === "personnel" && (<RenderPrintPreviewPendidikan data={dataResult.content.results as Personel[]} ref={printRef} />) }
                                            { typeData === "absensi" && (<RenderPrintPreviewAbsensi data={dataResult.content.results as AbsensiType[]} dateRange={dateRange} ref={printRef} />) }
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