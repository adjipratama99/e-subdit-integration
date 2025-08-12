import React, { useState } from "react";

import { Pendidikan, Personel } from "@/types/general";
import { createColumnHelper } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import ActionTable from "@/components/custom/action-table";
import { GET_LIST_PERSONNEL, GET_UPDATE_PERSONNEL } from "@/constant/key";
import { useCustomMutation } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import { useField, useForm } from "@tanstack/react-form";
import { Label } from "@/components/custom/form/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLoading } from "@/context/useLoadingContext";
import { useFileInput } from "@/hooks/useFileInput";
import { toFormData } from "@/lib/toFormData";
import { fetchPost } from "@/lib/Fetcher";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JenisPendidikan } from "@/constant/options";
import { Field } from "react-hook-form";
import Confirmation from "@/components/custom/confirmation";
import { FaEye } from "react-icons/fa";

const columnHelper = createColumnHelper<Personel>();

type FormValues = {
  id: string;
  nama: string;
  nrp: string;
  pangkat: string;
  jabatan: string;
  hasSkep: boolean;
  is_detective: boolean;
  hasCertified: boolean;
  skep: string; // nanti lu override di submit jd file(s)
  certified: string; // sama
  pendidikan: Pendidikan[];
};

export const columns = [
  columnHelper.accessor("created_at", {
    header: "Tanggal",
    cell: (info) => formatInTimeZone(info.getValue(), "UTC", "yyyy-MM-dd"),
  }),

  columnHelper.accessor("nama", {
    header: "Nama",
    cell: (info) => <div className="text-wrap">{info.getValue() ?? "-"}</div>,
  }),
  columnHelper.accessor("nrp", {
    header: "NRP",
  }),
  columnHelper.accessor("pangkat", {
    header: "Pangkat",
  }),
  columnHelper.accessor("id", {
    header: "Aksi",
    cell: (info) => {
      const [open, setOpen] = useState<boolean>(false);

      return (
        <ActionTable
          data={info.row.original}
          open={open}
          onOpenChange={setOpen}
          queryKey={[GET_LIST_PERSONNEL]}
          noDelete
          type="personnel"
          content={<ContentUpdate data={info.row.original} onClose={setOpen} />}
        />
      );
    },
  }),
];

function ContentUpdate({
  data,
  onClose,
}: {
  data: Personel;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
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
    mutationKey: [GET_UPDATE_PERSONNEL],
    url: "/api/personnel",
    makeLoading: true,
    callbackResult(res) {
      if (res.code === 0) {
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] });
        onClose(false);
      }

      return res;
    },
  });

  const defaultValues: FormValues = {
    id: String(data.id ?? ""),
    nama: String(data.nama ?? ""),
    nrp: String(data.nrp ?? ""),
    pangkat: String(data.pangkat ?? ""),
    jabatan: String(data.jabatan ?? ""),
    hasSkep: Boolean(data.skep),
    is_detective: Boolean(data.is_detective),
    hasCertified: Boolean(data.certified),
    skep: String(data.skep ?? ""),
    certified: String(data.certified ?? ""),
    pendidikan: (data.pendidikan ?? []) as Pendidikan[],
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const params = {
        action: "UPDATE",
        ...value,
        ...(skepFiles && skepFiles.length && { skep: skepFiles }),
        ...(certifiedFiles &&
          certifiedFiles.length && { certified: certifiedFiles }),
      };

      const fd = toFormData(params, {
        arrayFormat: "indices",
        booleanAs: "string",
      });

      setLoading(true);

      if (
        value.hasSkep &&
        skepFiles.length === 0 &&
        data.skep_urls &&
        data.skep_urls.length === 0
      ) {
        toast.error("Mohon upload file SKEP");
        setLoading(false);
        return;
      }

      if (
        value.hasCertified &&
        certifiedFiles.length === 0 &&
        data.certified_urls &&
        data.certified_urls.length === 0
      ) {
        toast.error("Mohon upload file Sertifikasi");
        setLoading(false);
        return;
      }

      const response = await fetchPost({
        url: "/api/personnel",
        body: fd,
      });

      setLoading(false);

      if (response.code === 0) {
        toast.success(response.message);
        query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] });
        onClose?.(false);
      } else {
        toast.success(response.message);
      }
    },
  });

  // Hindari useField untuk array pendidikan agar tidak memicu deep generic inference
  const pendidikanField = useField({ form, name: "pendidikan" as const });
  const skepField = useField({ form, name: "hasSkep" as const });
  const sertifikasiField = useField({ form, name: "hasCertified" as const });

  const addPendidikan = () => {
    const current: Pendidikan[] =
      (form.state.values.pendidikan as Pendidikan[]) || [];
    form.setFieldValue("pendidikan", [
      ...current,
      {
        id: null,
        jenis: "",
        nama_sekolah: "",
        tahun_mulai: "",
        tahun_selesai: "",
      },
    ]);
  };

  const removePendidikan = async (idx: number) => {
    const current: Pendidikan[] =
      (form.state.values.pendidikan as Pendidikan[]) || [];
    const currentData = current.find((_: unknown, i: number) => i === idx);

    const response = await fetchPost({
      url: "/api/pendidikan",
      body: { action: "DELETE", id: currentData?.id },
    });

    if (response?.code === 0) {
      const newPendidikan = current.filter(
        (_: unknown, i: number) => i !== idx
      );
      form.setFieldValue("pendidikan", newPendidikan);
    }
  };

  const handleDeleteFile = async (files: string[], type: string) => {
    setLoading(true);

    const response = await fetchPost({
      url: "/api/personnel",
      body: { action: "DELETE", files, isStorage: true, type },
    });

    setLoading(false);

    if (response.code === 0) {
      toast.success("File berhasil dihapus");
      query.invalidateQueries({ queryKey: [GET_LIST_PERSONNEL] });
    } else {
      toast.error("Gagal menghapus file");
    }
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
              children={(field: Field) => (
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

            <div className="flex col-span-2 sm:col-span-4 md:col-auto mt-2 gap-2 items-center justify-center md:items-baseline md:flex-col">
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

            <div className="col-span-2 sm:col-span-4 grid grid-cols-2 gap-4">
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
                              {f.name} • {(f.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
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
                              {f.name} • {(f.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
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

              {data.skep_urls && data.skep_urls.length ? (
              <div className="flex flex-col gap-4">
                <Label value="SKEP URL" />
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {data.skep_urls.map((url, i) => (
                    <li key={i} className="flex items-center flex-col md:flex-row gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-ellipsis flex items-center gap-2"
                      >
                        <FaEye /> Lihat SKEP
                      </a>
                      <Confirmation
                        trigger={
                          <Button size="sm" variant="outline">
                            Hapus
                          </Button>
                        }
                        message="Apakah Anda yakin ingin menghapus SKEP ini?"
                        onConfirm={() =>
                          handleDeleteFile(
                            data.skep_urls.map(
                              (url) =>
                                `${data.nrp}/${
                                  url.split("/")[url.split("/").length - 1]
                                }`
                            ) || [],
                            "skep"
                          )
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              ""
            )}

            {data.certified_urls && data.certified_urls.length ? (
              <div className="flex flex-col gap-4">
                <Label value="Sertifikasi URL" />
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {data.certified_urls.map((url, i) => (
                    <li key={i} className="flex items-center gap-2 flex-col md:flex-row">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-ellipsis flex items-center gap-2"
                      >
                        <FaEye /> Lihat Sertifikat
                      </a>
                      <Confirmation
                        trigger={
                          <Button size="sm" variant="outline">
                            Hapus
                          </Button>
                        }
                        message="Apakah Anda yakin ingin menghapus Sertifikasi ini?"
                        onConfirm={() =>
                          handleDeleteFile(
                            data.certified_urls.map(
                              (url) =>
                                `${data.nrp}/${
                                  url.split("/")[url.split("/").length - 1]
                                }`
                            ) || [],
                            "certified"
                          )
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              ""
            )}
            </div>
          </div>
        </fieldset>

        <fieldset className="border rounded-md p-4">
          <legend>Pendidikan Personel</legend>

          {pendidikanField.state.value?.map((_, idx) => (
            <div
              key={`pendidikan_${idx}`}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-2xl border mb-4"
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
                <Confirmation
                  trigger={
                    <Button type="button" variant="destructive">
                      Hapus
                    </Button>
                  }
                  onConfirm={() => removePendidikan(idx)}
                  message="Apakah Anda yakin ingin menghapus pendidikan ini?"
                />
              </div>
            </div>
          ))}

          <Button type="button" onClick={addPendidikan} variant="outline">
            Tambah Pendidikan
          </Button>
        </fieldset>
      </div>
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Updating..." : "Submit"}
      </Button>
    </form>
  );
}
