"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import React from "react";
import { useCustomMutation, useCustomQuery } from "@/hooks/useQueryData";
import { GET_INSERT_PERSONNEL_EDUCATION, GET_LIST_PERSONNEL, GET_LIST_PERSONNEL_EDUCATION } from "@/constant/key";
import 'rsuite/DatePicker/styles/index.css';
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Personel } from "@/types/general";
import { Select } from "@/components/custom/form/select";
import { JenisPendidikan } from "@/constant/options";

export function PendidikanPersonelFormContent({ onSuccess }: { onSuccess?: () => void }): React.JSX.Element {
  const query = useQueryClient()
  const mutation = useCustomMutation({
    mutationKey: [GET_INSERT_PERSONNEL_EDUCATION],
    url: "/api/pendidikan",
    makeLoading: true,
    callbackResult(res) {
      if(res.code === 0) {
        onSuccess!()
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL_EDUCATION] })
      }
    },
  });

  const {
    data: personnel
  } = useCustomQuery({
    queryKey: [GET_LIST_PERSONNEL],
    params: { offset: 0, limit: 9999 },
    url: "/api/personnel",
    makeLoading: true,
    callbackResult(res) {
      let results = []
      if(res.code === 0) {
        if(res.content.count) {
          results = res.content.results.map((opt: Personel) => ({ value: opt.id, text: opt.nama }))
        }
      }

      return results
    },
  })

  const form = useForm({
    defaultValues: {
      personel_id: "",
      jenis: "",
      nama_sekolah: "",
      tahun_mulai: "",
    },
    onSubmit: async ({ value }) => {
      const params = {
        action: "CREATE",
        ...value
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
        name="personel_id"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Personel" isRequired />
            <div className="col-span-2">
              <Select
                options={personnel}
                isModal
                placeholder="Pilih Personel"
                className="w-full"
                value={field.state.value}
                onChange={(val) => field.handleChange(val as string)}
              />
            </div>
          </div>
        )}
      />

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
        {mutation.isPending ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
}
