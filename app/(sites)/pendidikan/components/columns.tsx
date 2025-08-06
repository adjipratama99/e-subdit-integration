import React, { useState } from "react";

import { Pendidikan } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import ActionTable from "@/components/custom/action-table";
import { GET_LIST_PERSONNEL, GET_LIST_PERSONNEL_EDUCATION, GET_UPDATE_PERSONNEL } from "@/constant/key";
import { useCustomMutation } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { JenisPendidikan } from "@/constant/options";
import { Select } from "@/components/custom/form/select";

const columnHelper = createColumnHelper<Pendidikan>();

export const columns = [
  columnHelper.accessor("created_at", {
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
    header: "Jabatan"
  }),
  columnHelper.accessor("nama_sekolah", {
    header: "Nama Sekolah",
    cell: (info) => <div className="text-wrap">{ info.getValue() }</div>,
  }),
  columnHelper.accessor("jenis", {
    header: "Jenis",
  }),
  columnHelper.accessor("tahun_mulai", {
    header: "Tahun Mulai",
  }),
  columnHelper.accessor("tahun_selesai", {
    header: "Tahun Selesai",
  }),
  columnHelper.accessor("id", {
    header: "Aksi",
    cell: (info) => {
      const [open, setOpen] = useState<boolean>(false)
      
      return (
        <ActionTable
          data={info.row.original}
          open={open}
          onOpenChange={setOpen}
          queryKey={[GET_LIST_PERSONNEL_EDUCATION]}
          type="pendidikan"
          content={<ContentUpdate data={info.row.original} onClose={setOpen} />}
        />
      )
    }
  }),
];

function ContentUpdate({ data, onClose }: { data: Pendidikan; onClose: React.Dispatch<React.SetStateAction<boolean>> }): React.JSX.Element {
  const query = useQueryClient()

  const mutation = useCustomMutation({
    mutationKey: [GET_UPDATE_PERSONNEL],
    url: "/api/pendidikan",
    makeLoading: true,
    callbackResult(res) {
      if(res.code === 0) {
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] })
        onClose(false)
      }

      return res
    },
  })

  const form = useForm({
    defaultValues: {
      jenis: data.jenis,
      nama_sekolah: data.nama_sekolah,
      tahun_mulai: data.tahun_mulai,
      tahun_selesai: data.tahun_selesai
    },
    onSubmit: async ({ value }) => {
      const params = {
        action: "UPDATE",
        id: data.id,
        updateData: { ...value }
      }

      await mutation.mutateAsync(params);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }} className="space-y-4">
      <form.Field
        name="jenis"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Jenis Pendidikan" isRequired />
            <div className="col-span-2">
              <Select
                options={JenisPendidikan}
                isModal
                placeholder="Pilih Jenis Pendidikan"
                className="w-full"
                value={field.state.value}
                onChange={(val) => field.handleChange(val as string)}
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-red-500 text-xs">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          </div>
        )}
      />

      <form.Field
        name="nama_sekolah"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Nama Sekolah" isRequired />
            <div className="col-span-2">
            <Input
                type="text"
                placeholder="Masukkan Nama Sekolah ..."
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value}
                required
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-red-500 text-xs">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          </div>
        )}
      />

      <form.Field
        name="tahun_mulai"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Tahun Mulai" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan Tahun Mulai ..."
                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                value={field.state.value}
                required
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-red-500 text-xs">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          </div>
        )}
      />

      <form.Field
        name="tahun_selesai"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Tahun Selesai" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan Tahun Selesai ..."
                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                value={field.state.value}
                required
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-red-500 text-xs">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          </div>
        )}
      />

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Updating..." : "Submit"}
      </Button>
    </form>
  )
}