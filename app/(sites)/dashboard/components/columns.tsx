import React from "react";

import { AbsensiType, Personel } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

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
    cell: (info) => format(new Date(info.getValue()!), 'HH:mm') ?? "-",
  }),

  columnHelper.accessor("jam_pulang", {
    header: "Jam Pulang",
    cell: (info) => format(new Date(info.getValue()!), 'HH:mm') ?? "-",
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
];
