import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAbsensiRealtime(onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel("personel_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: process.env.NEXT_PUBLIC_ATTENDANCE_NAME,
        },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}
