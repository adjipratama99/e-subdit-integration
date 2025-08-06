import React, { useState } from "react";

import { Personel } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import ActionTable from "@/components/custom/action-table";
import { GET_LIST_PERSONNEL, GET_UPDATE_PERSONNEL } from "@/constant/key";
import { useCustomMutation } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";

const columnHelper = createColumnHelper<Personel>();

export const columns = [
  columnHelper.accessor("created_at", {
    header: "Tanggal",
    cell: (info) =>
      formatInTimeZone(info.getValue(), "UTC", "yyyy-MM-dd"),
  }),

  columnHelper.accessor("nama", {
    header: "Nama",
    cell: (info) => (
      <div className="text-wrap">
        {info.getValue() ?? "-"}
      </div>
    ),
  }),
  columnHelper.accessor("nrp", {
    header: "NRP"
  }),
  columnHelper.accessor("pangkat", {
    header: "Pangkat",
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
          queryKey={[GET_LIST_PERSONNEL]}
          type="personnel"
          content={<ContentUpdate data={info.row.original} onClose={setOpen} />}
        />
      )
    }
  }),
];

function ContentUpdate({ data, onClose }: { data: Personel; onClose: React.Dispatch<React.SetStateAction<boolean>> }): React.JSX.Element {
  const query = useQueryClient()

  const mutation = useCustomMutation({
    mutationKey: [GET_UPDATE_PERSONNEL],
    url: "/api/personnel",
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
      nama: data.nama,
      nrp: data.nrp,
      pangkat: data.pangkat,
      jabatan: data.jabatan,
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
        name="nama"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Nama" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan nama ..."
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
        name="nrp"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="NRP" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan NRP ..."
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
        name="jabatan"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Jabatan" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan Jabatan ..."
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
        name="pangkat"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Pangkat" isRequired />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan Pangkat ..."
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

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Updating..." : "Submit"}
      </Button>
    </form>
  )
}