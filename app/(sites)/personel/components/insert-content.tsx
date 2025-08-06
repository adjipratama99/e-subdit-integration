"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import React from "react";
import { useCustomMutation } from "@/hooks/useQueryData";
import { GET_INSERT_PERSONNEL, GET_LIST_PERSONNEL } from "@/constant/key";
import 'rsuite/DatePicker/styles/index.css';
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

export function PersonelFormContent({ onSuccess }: { onSuccess?: () => void }): React.JSX.Element {
  const query = useQueryClient()
  const mutation = useCustomMutation({
    mutationKey: [GET_INSERT_PERSONNEL],
    url: "/api/personnel",
    makeLoading: true,
    callbackResult(res) {
      if(res.code === 0) {
        onSuccess!()
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] })
      }
    },
  });

  const form = useForm({
    defaultValues: {
      nama: "",
      nrp: "",
      pangkat: "",
      jabatan: "",
      skep: "",
      is_detective: false,
      certified: false,
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

      <form.Field
        name="skep"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="SKEP" />
            <div className="col-span-2">
              <Input
                type="text"
                placeholder="Masukkan jika ada SKEP ..."
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value}
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
          name="is_detective"
          children={(field) => (
            <div className="flex items-center gap-2">
              <div className="-mb-1">
                <Switch
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  checked={field.state.value}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-red-500 text-xs">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
              <Label value="Penyidik" />
            </div>
          )}
        />

        <form.Field
          name="certified"
          children={(field) => (
            <div className="flex items-center gap-2">
              <div className="-mb-1">
                <Switch
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  checked={field.state.value}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-red-500 text-xs">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
              <Label value="Sertifikasi" />
            </div>
          )}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
}
