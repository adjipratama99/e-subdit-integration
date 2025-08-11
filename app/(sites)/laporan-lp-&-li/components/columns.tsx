import React, { useState } from "react";

import { Penanganan } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import ActionTable from "@/components/custom/action-table";
import { GET_LIST_PENANGANAN_LP_LI, GET_UPDATE_PERSONNEL } from "@/constant/key";
import { useCustomMutation } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { JenisLPLI, StatusProses } from "@/constant/options";
import { Select } from "@/components/custom/form/select";
import { DatePicker, TagInput } from "rsuite";
import { Textarea } from "@/components/ui/textarea";

const columnHelper = createColumnHelper<Penanganan>();

export const columns = [
  columnHelper.accessor("tanggal", {
    header: "Tanggal",
    cell: (info) =>
      formatInTimeZone(info.getValue(), "UTC", "yyyy-MM-dd"),
  }),

  columnHelper.accessor("judul", {
    header: "Judul",
    cell: (info) => (
      <div className="text-wrap">
        {info.getValue() ?? "-"}
      </div>
    ),
  }),
  columnHelper.accessor("nomor", {
    header: "Nomor Pelaporan",
    cell: (info) => <div className="text-wrap">{ info.getValue() }</div>
  }),
  columnHelper.accessor("jenis", {
    header: "Jenis",
  }),
  columnHelper.accessor("pasal", {
    header: "Pasal",
    cell: (info) => <ul>{ info.getValue().map(pasal => <li key={pasal} className="text-wrap list-decimal">{ pasal }</li>) }</ul>
  }),
  columnHelper.accessor("pelapor", {
    header: "Pelapor",
    cell: (info) => <ul>{ info.getValue().map(pelapor => <li key={pelapor} className="text-wrap list-decimal">{ pelapor }</li>) }</ul>
  }),
  columnHelper.accessor("terlapor", {
    header: "Terlapor",
    cell: (info) => <ul>{ info.getValue().map(terlapor => <li key={terlapor} className="text-wrap list-decimal">{ terlapor }</li>) }</ul>
  }),
  columnHelper.accessor("user_create", {
    header: "Dibuat oleh"
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
          queryKey={[GET_LIST_PENANGANAN_LP_LI]}
          type="lp-li"
          content={<ContentUpdate data={info.row.original} onClose={setOpen} />}
        />
      )
    }
  }),
];

function ContentUpdate({ data, onClose }: { data: Penanganan; onClose: React.Dispatch<React.SetStateAction<boolean>> }): React.JSX.Element {
  const query = useQueryClient()

  const mutation = useCustomMutation({
    mutationKey: [GET_UPDATE_PERSONNEL],
    url: "/api/lp-li",
    makeLoading: true,
    callbackResult(res) {
      if(res.code === 0) {
        query.invalidateQueries({ queryKey: [GET_LIST_PENANGANAN_LP_LI] })
        onClose(false)
      }

      return res
    },
  })

  const form = useForm({
    defaultValues: {
      jenis: data.jenis,
      nomor: data.nomor,
      judul: data.judul,
      tanggal: new Date(data.tanggal),
      kronologis: data.kronologis,
      pasal: data.pasal,
      pelapor: data.pelapor,
      saksi: data.saksi,
      terlapor: data.terlapor,
      status_proses: data.status_proses,
      catatan_hambatan: data.catatan_hambatan,
      rtl: data.rtl,
      keterangan: data.keterangan,
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
    }}>
      <div className="max-h-[600px] overflow-y-scroll space-y-4">
        <form.Field
          name="tanggal"
          children={(field) => (
            <div className="grid grid-cols-3 gap-4">
              <Label value="Tanggal Pelaporan" isRequired />
              <div className="col-span-2">
                <DatePicker
                  container={() => document.querySelector('[role="dialog"]') || document.body}
                  value={field.state.value}
                  format="yyyy-MM-dd"
                  onChange={(hour) => field.handleChange(hour as Date)}
                  className="w-full"
                />
              </div>
            </div>
          )}
        />

        <form.Field
          name="nomor"
          children={(field) => (
            <div className="grid grid-cols-3 gap-4">
              <Label value="Nomor Pelaporan" isRequired />
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Masukkan nomor ..."
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                />
              </div>
            </div>
          )}
        />

        <form.Field
          name="judul"
          children={(field) => (
            <div className="grid grid-cols-3 gap-4">
              <Label value="Judul Pelaporan" isRequired />
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Masukkan Judul Pelaporan ..."
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                />
              </div>
            </div>
          )}
        />

        <form.Field
          name="jenis"
          children={(field) => (
            <div className="grid grid-cols-3 gap-4">
              <Label value="Jenis Pelaporan" isRequired />
              <div className="col-span-2">
                <Select
                  options={JenisLPLI}
                  isModal
                  placeholder="Pilih Jenis"
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
          name="kronologis"
          children={(field) => (
            <div className="grid grid-cols-1 gap-4">
              <Label value="Koronologis" isRequired />
              <div>
                <Textarea
                  placeholder="Masukkan Kronologis ..."
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

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="pasal"
            children={(field) => (
              <div className="grid grid-cols-1 gap-2">
                <Label value="Pasal" isRequired />
                <div>
                  <TagInput
                    onChange={(value) => field.handleChange(value as string[])}
                    value={field.state.value}
                    block
                    placeholder="Masukkan Pasal dan pisahkan dengan [Enter]"
                    className="w-full h-[80px]"
                    trigger={['Enter']}
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
            name="terlapor"
            children={(field) => (
              <div className="grid grid-cols-1 gap-2">
                <Label value="Terlapor" />
                <div>
                  <TagInput
                    onChange={(value) => field.handleChange(value as string[])}
                    value={field.state.value}
                    block
                    placeholder="Masukkan Terlapor dan pisahkan dengan [Enter]"
                    className="w-full h-[80px]"
                    trigger={['Enter']}
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
            name="pelapor"
            children={(field) => (
              <div className="grid grid-cols-1 gap-2">
                <Label value="Pelapor" isRequired />
                <div>
                  <TagInput
                    onChange={(value) => field.handleChange(value as string[])}
                    value={field.state.value}
                    block
                    placeholder="Masukkan Pelapor dan pisahkan dengan [Enter]"
                    className="w-full h-[80px]"
                    trigger={['Enter']}
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
            name="saksi"
            children={(field) => (
              <div className="grid grid-cols-1 gap-2">
                <Label value="Saksi" />
                <div>
                  <TagInput
                    onChange={(value) => field.handleChange(value as string[])}
                    value={field.state.value}
                    block
                    placeholder="Masukkan Saksi dan pisahkan dengan [Enter]"
                    className="w-full h-[80px] overflow-y-scroll"
                    trigger={['Enter']}
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
        </div>

        <form.Field
          name="status_proses"
          children={(field) => (
            <div className="grid grid-cols-3 gap-4">
              <Label value="Status Proses" isRequired />
              <div className="col-span-2">
                <Select
                  options={StatusProses}
                  isModal
                  placeholder="Pilih Status Proses"
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
          name="catatan_hambatan"
          children={(field) => (
            <div className="grid grid-cols-1 gap-4">
              <Label value="Hambatan" />
              <div>
                <Textarea
                  placeholder="Masukkan hambatan ..."
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
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
          name="rtl"
          children={(field) => (
            <div className="grid grid-cols-1 gap-4">
              <Label value="Rencana Tindak Lanjut" />
              <div>
                <Textarea
                  placeholder="Masukkan rencana tindak lanjut ..."
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
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
          name="keterangan"
          children={(field) => (
            <div className="grid grid-cols-1 gap-4">
              <Label value="Keterangan" />
              <div>
                <Textarea
                  placeholder="Masukkan keterangan ..."
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
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
      </div>
      <Button type="submit" disabled={mutation.isPending} className="w-full mt-4">
        {mutation.isPending ? "Updating..." : "Submit"}
      </Button>
    </form>
  )
}