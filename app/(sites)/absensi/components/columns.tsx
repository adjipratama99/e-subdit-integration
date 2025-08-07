import React, { useState } from "react";

import { AbsensiType, Personel } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { differenceInMinutes, format } from "date-fns";
import ActionTable from "@/components/custom/action-table";
import { GET_LIST_ABSENSI } from "@/constant/key";

const columnHelper = createColumnHelper<AbsensiType>();

export const columns = [
  columnHelper.accessor("tanggal", {
    header: "Tanggal",
    cell: (info) =>
      formatInTimeZone(info.getValue(), "UTC", "yyyy-MM-dd"),
  }),

  columnHelper.accessor("personel.nama", {
    header: "Nama",
    cell: (info) => (
      <div className="text-wrap">
        {info.getValue() ?? "-"}
      </div>
    ),
  }),

  columnHelper.accessor("personel.jabatan", {
    header: "Jabatan",
    cell: (info) => (
      <div className="text-wrap">
        {info.getValue() ?? "-"}
      </div>
    ),
  }),

  columnHelper.accessor("personel.nrp", {
    header: "NRP",
    cell: (info) => (
      <div className="text-wrap">
        {info.getValue() ?? "-"}
      </div>
    ),
  }),

  columnHelper.accessor("jam_datang", {
    header: "Jam Datang",
    cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'yyyy-MM-dd HH:mm') : "-",
  }),

  columnHelper.accessor("jam_pulang", {
    header: "Jam Pulang",
    cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'yyyy-MM-dd HH:mm') : "-",
  }),
  columnHelper.accessor("id", {
    header: "Lama Kerja",
    cell: (info) => {
      const diffMinutes = differenceInMinutes(info.row.original.jam_pulang, info.row.original.jam_datang)
      const minutes = diffMinutes % 60

      return (info.row.original.status === "Hadir") ? `${ Math.round(diffMinutes / 60) }:${ minutes }` : ""
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue() ?? "-",
  }),

  columnHelper.accessor("created_at", {
    header: "Dibuat Pada",
    cell: (info) =>
      formatInTimeZone(info.getValue(), "UTC", "yyyy-MM-dd HH:mm"),
  }),

  columnHelper.accessor("id", {
    id: String(Math.round(Math.random() * 10000)),
    header: "Action",
    cell: (info) => {
      const [open, setOpen] = useState<boolean>(false)
      
      return (
        <ActionTable
          data={info.row.original as AbsensiType}
          open={open}
          onOpenChange={setOpen}
          queryKey={[GET_LIST_ABSENSI]}
          noUpdate
          type="absensi"
        />
      )
    }
  }),
];
