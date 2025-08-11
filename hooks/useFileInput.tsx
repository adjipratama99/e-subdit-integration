import { useCallback, useMemo, useState } from "react";

type UseFileInputOptions = {
  /** Contoh: ["image/*", "application/pdf", ".csv"] */
  accept: string[];
  /** Maksimal ukuran per file (dalam MB) */
  maxSizeMB: number;
  /** Boleh pilih banyak file? default: false */
  multiple?: boolean;
};

type UseFileInputResult = {
  files: File[];
  /** Pesan error terakhir (null kalau aman) */
  error: string | null;
  /** Props siap pakai untuk <input type="file" /> */
  inputProps: {
    type: "file";
    accept: string;
    multiple?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  /** Hapus file index tertentu */
  removeAt: (index: number) => void;
  /** Reset semua file + error */
  reset: () => void;
};

export function useFileInput({
  accept,
  maxSizeMB,
  multiple = false,
}: UseFileInputOptions): UseFileInputResult {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // String untuk atribut accept pada <input>
  const acceptAttr = useMemo(() => accept.join(","), [accept]);

  const isAllowedType = useCallback(
    (file: File) => {
      const name = file.name.toLowerCase();
      const mime = (file.type || "").toLowerCase();
      const ext = name.includes(".") ? `.${name.split(".").pop()}` : "";

      return accept.some((rule) => {
        const r = rule.toLowerCase().trim();

        // Rule berbasis ekstensi, contoh ".png", ".csv"
        if (r.startsWith(".")) {
          return ext === r;
        }

        // Rule berbasis mime "image/*" / "image/png" / "application/pdf"
        if (r.includes("/")) {
          if (r.endsWith("/*")) {
            const prefix = r.slice(0, r.indexOf("/"));
            return mime.startsWith(`${prefix}/`);
          }
          return mime === r;
        }

        // fallback: kalau user kasih string aneh, anggap nggak match
        return false;
      });
    },
    [accept]
  );

  const validate = useCallback(
    (picked: File[]) => {
      const maxBytes = maxSizeMB * 1024 * 1024;

      for (const f of picked) {
        if (!isAllowedType(f)) {
          return `Tipe file "${f.name}" tidak diizinkan. Izinkan: ${accept.join(", ")}`;
        }
        if (f.size > maxBytes) {
          return `Ukuran file "${f.name}" melebihi ${maxSizeMB} MB.`;
        }
      }
      return null;
    },
    [accept, isAllowedType, maxSizeMB]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      if (picked.length === 0) return;

      // Kalau single, ambil file pertama saja
      const incoming = multiple ? picked : [picked[0]];

      const msg = validate(incoming);
      if (msg) {
        setError(msg);
        setFiles([]);
      } else {
        setError(null);
        setFiles(incoming);
      }

      // Optional: clear input value biar bisa re-pick file yang sama
      e.target.value = "";
    },
    [multiple, validate]
  );

  const removeAt = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  return {
    files,
    error,
    inputProps: {
      type: "file" as const,
      accept: acceptAttr,
      multiple,
      onChange,
    },
    removeAt,
    reset,
  };
}
