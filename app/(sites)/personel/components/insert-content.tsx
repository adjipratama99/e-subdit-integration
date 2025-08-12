"use client";

import { useField, useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useCustomMutation } from "@/hooks/useQueryData";
import { GET_INSERT_PERSONNEL, GET_LIST_PERSONNEL } from "@/constant/key";
import "rsuite/DatePicker/styles/index.css";
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JenisPendidikan } from "@/constant/options";
import { useFileInput } from "@/hooks/useFileInput";
import { toFormData } from "@/lib/toFormData";
import { fetchPost } from "@/lib/Fetcher";
import { useLoading } from "@/context/useLoadingContext";
import { toast } from "sonner";

export function PersonelFormContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}): React.JSX.Element {
  const { setLoading } = useLoading();
  const {
    files: skepFiles,
    error: skepError,
    inputProps: skepInputProps,
    removeAt: skepRemoveAt,
  } = useFileInput({
    accept: ["application/pdf"], // atur sesukamu
    maxSizeMB: 0.2, // 5 MB per file
    multiple: false,
  });

  const {
    files: certifiedFiles,
    error: certifiedError,
    inputProps: certifiedInputProps,
    removeAt: certifiedRemoveAt,
  } = useFileInput({
    accept: ["application/pdf"], // atur sesukamu
    maxSizeMB: 0.2, // 5 MB per file
    multiple: false,
  });

  const query = useQueryClient();
  const mutation = useCustomMutation({
    mutationKey: [GET_INSERT_PERSONNEL],
    url: "/api/personnel",
    makeLoading: true,
    callbackResult(res) {
      if (res.code === 0) {
        onSuccess!();
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      nama: "",
      nrp: "",
      pangkat: "",
      jabatan: "",
      hasSkep: false,
      is_detective: false,
      hasCertified: false,
      skep: [],
      certified: [],
      pendidikan: [
        {
          jenis: "",
          nama_sekolah: "",
          tahun_mulai: "",
          tahun_selesai: "",
        },
      ],
    },
    onSubmit: async ({ value }) => {
      const params = {
        action: "CREATE",
        ...value,
        skep: skepFiles,
        certified: certifiedFiles,
      };

      const fd = toFormData(params, {
        arrayFormat: "indices",
        booleanAs: "string",
      });

      setLoading(true);

      const response = await fetchPost({
        url: "/api/personnel",
        body: fd,
      });

      setLoading(false);

      if (response.code === 0) {
        toast.success(response.message);
        onSuccess?.();
      } else {
        toast.success(response.message);
      }
    },
  });

  const pendidikanField = useField({ form, name: "pendidikan" });
  const skepField = useField({ form, name: "hasSkep" });
  const sertifikasiField = useField({ form, name: "hasCertified" });

  const addPendidikan = () => {
    const currentPendidikan = pendidikanField.state.value || [];
    form.setFieldValue("pendidikan", [
      ...currentPendidikan,
      {
        jenis: "",
        nama_sekolah: "",
        tahun_mulai: "",
        tahun_selesai: "",
      },
    ]);
  };

  const removePendidikan = (idx: number) => {
    const currentPendidikan = pendidikanField.state.value || [];
    const newPendidikan = currentPendidikan.filter((_, i) => i !== idx);
    form.setFieldValue("pendidikan", newPendidikan);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="max-h-[800px] overflow-y-scroll">
        <fieldset className="border rounded-md p-4">
          <legend>Informasi Personel</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            <form.Field
              name="nama"
              children={(field) => (
                <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-4">
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

            <div className="col-span-2 sm:col-span-4 md:col-auto flex mt-2 gap-2 items-center justify-center md:items-baseline md:flex-col">
              <form.Field
                name="hasSkep"
                children={(field) => (
                  <div className="flex items-center gap-2">
                    <div className="-mb-1">
                      <Switch
                        onCheckedChange={(checked) =>
                          field.handleChange(checked)
                        }
                        checked={field.state.value}
                      />
                      {field.state.meta.errors?.[0] && (
                        <p className="text-red-500 text-xs">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                    <Label value="SKEP" />
                  </div>
                )}
              />

              <form.Field
                name="is_detective"
                children={(field) => (
                  <div className="flex items-center gap-2">
                    <div className="-mb-1">
                      <Switch
                        onCheckedChange={(checked) =>
                          field.handleChange(checked)
                        }
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
                name="hasCertified"
                children={(field) => (
                  <div className="flex items-center gap-2">
                    <div className="-mb-1">
                      <Switch
                        onCheckedChange={(checked) =>
                          field.handleChange(checked)
                        }
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

            {skepField.state.value && (
              <div className="flex flex-col gap-4">
                <Label value="SKEP" isRequired />
                <div className="col-span-2">
                  <Input {...skepInputProps} className="mb-1" />

                  {skepError && (
                    <p className="text-sm text-red-500">{skepError}</p>
                  )}

                  {skepFiles.length > 0 && (
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {skepFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>
                            {f.name} • {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => skepRemoveAt(i)}
                          >
                            Hapus
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {sertifikasiField.state.value && (
              <div className="flex flex-col gap-4">
                <Label value="Sertifikasi" isRequired />
                <div className="col-span-2">
                  <Input {...certifiedInputProps} className="mb-1" />

                  {certifiedError && (
                    <p className="text-sm text-red-500">{certifiedError}</p>
                  )}

                  {certifiedFiles.length > 0 && (
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {certifiedFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>
                            {f.name} • {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => certifiedRemoveAt(i)}
                          >
                            Hapus
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="border rounded-md p-4">
          <legend>Pendidikan Personel</legend>

          {pendidikanField.state.value?.map((_, idx) => (
            <div
              key={`pendidikan_${idx}`}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl border mb-4"
            >
              <div className="flex flex-col gap-2">
                <Label value="Nama Sekolah" isRequired />
                <Input
                  placeholder="Masukkan Nama Sekolah ..."
                  onChange={(e) => {
                    const newPendidikan = [
                      ...(pendidikanField.state.value || []),
                    ];
                    newPendidikan[idx] = {
                      ...newPendidikan[idx],
                      nama_sekolah: e.target.value,
                    };
                    form.setFieldValue("pendidikan", newPendidikan);
                  }}
                  required
                  value={pendidikanField.state.value?.[idx]?.nama_sekolah || ""}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label value="Tahun Mulai" isRequired />
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2020"
                  onChange={(e) => {
                    const newPendidikan = [
                      ...(pendidikanField.state.value || []),
                    ];
                    newPendidikan[idx] = {
                      ...newPendidikan[idx],
                      tahun_mulai: e.target.value,
                    };
                    form.setFieldValue("pendidikan", newPendidikan);
                  }}
                  required
                  value={pendidikanField.state.value?.[idx]?.tahun_mulai || ""}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label value="Tahun Selesai" isRequired />
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2024"
                  onChange={(e) => {
                    const newPendidikan = [
                      ...(pendidikanField.state.value || []),
                    ];
                    newPendidikan[idx] = {
                      ...newPendidikan[idx],
                      tahun_selesai: e.target.value,
                    };
                    form.setFieldValue("pendidikan", newPendidikan);
                  }}
                  required
                  value={
                    pendidikanField.state.value?.[idx]?.tahun_selesai || ""
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label value="Jenis" isRequired />
                <Select
                  onValueChange={(val: string) => {
                    const newPendidikan = [
                      ...(pendidikanField.state.value || []),
                    ];
                    newPendidikan[idx] = { ...newPendidikan[idx], jenis: val };
                    form.setFieldValue("pendidikan", newPendidikan);
                  }}
                  value={pendidikanField.state.value?.[idx]?.jenis || ""}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {JenisPendidikan.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="self-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removePendidikan(idx)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" onClick={addPendidikan} variant="outline">
            Tambah Pendidikan
          </Button>
        </fieldset>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
