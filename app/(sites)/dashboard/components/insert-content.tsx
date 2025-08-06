"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import React from "react";
import { useCustomMutation, useCustomQuery } from "@/hooks/useQueryData";
import { GET_INSERT_ABSENSI, GET_LIST_PERSONNEL } from "@/constant/key";
import { formatInTimeZone } from "date-fns-tz"
import { DatePicker } from "rsuite"
import 'rsuite/DatePicker/styles/index.css';
import { addDays, endOfDay, startOfDay, format } from "date-fns";
import { Label } from "@/components/custom/form/label";
import { Select } from "@/components/custom/form/select";
import { Personel } from "@/types/general";
import { statusCheck } from "@/constant/options";

const disableAfterOneDays = (date: Date) => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  return date < today || date > tomorrow;
};

const disableBeforeToday = (date: Date) => {
  const today = new Date();

  return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export function AbsensiFormContent({ onSuccess }: { onSuccess?: () => void }): React.JSX.Element {
  const mutation = useCustomMutation({
    mutationKey: [GET_INSERT_ABSENSI],
    url: "/api/absensi",
    makeLoading: true
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
      tanggal: formatInTimeZone(new Date(), 'UTC', 'yyyy-MM-dd'),
      jam_datang: startOfDay(new Date()),
      jam_pulang: endOfDay(new Date()),
      status: "",
    },
    onSubmit: async ({ value }) => {
      const {
        jam_datang,
        jam_pulang,
        status,
        personel_id,
        tanggal,
      } = value;

      const params = {
        action: "CREATE",
        jam_datang: format(new Date(jam_datang), 'yyyy-MM-dd HH:mm'),
        jam_pulang: format(new Date(jam_pulang), 'yyyy-MM-dd HH:mm'),
        status,
        personel_id,
        tanggal
      }

      await mutation.mutateAsync(params);
      onSuccess!()
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
        name="jam_datang"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Jam Datang" isRequired />
            <div className="col-span-2">
              <DatePicker
                container={() => document.querySelector('[role="dialog"]') || document.body}
                value={field.state.value}
                shouldDisableDate={disableBeforeToday}
                format="yyyy-MM-dd HH:mm"
                onChange={(hour) => field.handleChange(hour as Date)}
                className="w-full"
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
        name="jam_pulang"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Jam Pulang" isRequired />
            <div className="col-span-2">
              <DatePicker
                container={() => document.querySelector('[role="dialog"]') || document.body}
                value={field.state.value}
                shouldDisableDate={disableAfterOneDays}
                format="yyyy-MM-dd HH:mm"
                onChange={(hour) => field.handleChange(hour as Date)}
                className="w-full"
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
        name="status"
        children={(field) => (
          <div className="grid grid-cols-3 gap-4">
            <Label value="Status" isRequired />
            <div className="col-span-2">
              <Select
                value={field.state.value}
                onChange={(val) => field.handleChange(val as string)}
                options={statusCheck}
                className="w-full"
                placeholder="Pilih Status"
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
