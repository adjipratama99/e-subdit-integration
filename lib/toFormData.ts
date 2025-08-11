// utils/toFormData.ts
export type ToFormDataOptions = {
    arrayFormat?: "brackets" | "indices"; // users[] vs users[0]
    includeNull?: boolean;                 // default: false (skip null/undefined)
    booleanAs?: "string" | "number";       // "true"/"false" vs 1/0
  };
  
  export function toFormData(
    obj: Record<string, any>,
    opts: ToFormDataOptions = {}
  ): FormData {
    const {
      arrayFormat = "indices",
      includeNull = false,
      booleanAs = "string",
    } = opts;
  
    const fd = new FormData();
  
    const append = (key: string, value: any) => {
      // skip null/undefined
      if (value === undefined || value === null) {
        if (!includeNull) return;
        value = ""; // kalau tetap mau kirim null, kirim string kosong
      }
  
      // File/Blob langsung append
      if (value instanceof Blob || value instanceof File) {
        fd.append(key, value);
        return;
      }
  
      // Date => ISO
      if (value instanceof Date) {
        fd.append(key, value.toISOString());
        return;
      }
  
      // Boolean => "true"/"false" atau 1/0
      if (typeof value === "boolean") {
        fd.append(key, booleanAs === "number" ? (value ? "1" : "0") : String(value));
        return;
      }
  
      // Number/String biasa
      if (typeof value === "number" || typeof value === "string") {
        fd.append(key, String(value));
        return;
      }
  
      // Array
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          const k =
            arrayFormat === "indices" ? `${key}[${i}]` : `${key}[]`;
          append(k, v);
        });
        return;
      }
  
      // Object nested
      if (typeof value === "object") {
        Object.entries(value).forEach(([childKey, childVal]) => {
          append(`${key}[${childKey}]`, childVal);
        });
        return;
      }
  
      // Fallback
      fd.append(key, String(value));
    };
  
    Object.entries(obj).forEach(([k, v]) => append(k, v));
    return fd;
  }
  

  // utils/formdata.ts
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ambil semua File dari FormData untuk key berbasis array.
 * Support:
 *  - indices:   skep[0], skep[1], ...
 *  - brackets:  skep[]
 *  - bare:      skep (di-append berulang)
 * Optional nested: skep[0][file] (pakai opts.nestedKey = "file")
 */
export function getAllFiles(
  form: FormData,
  baseKey: string,
  opts?: { nestedKey?: string }
): File[] {
  const key = escapeRegExp(baseKey);
  const nested = opts?.nestedKey
    ? `\\[${escapeRegExp(opts.nestedKey)}\\]`
    : "";

  // Match indices: baseKey[<num>] atau baseKey[<num>][nestedKey]
  const idxRe = new RegExp(`^${key}\\[(\\d+)\\]${nested}$`);
  const indexed: Array<[number, File]> = [];

  for (const [k, v] of form.entries()) {
    const m = k.match(idxRe);
    if (m && v instanceof File && v.size >= 0) {
      indexed.push([Number(m[1]), v]);
    }
  }

  if (indexed.length) {
    // urutkan sesuai index
    return indexed.sort((a, b) => a[0] - b[0]).map(([, f]) => f);
  }

  // Fallback: brackets & bare
  const fallback = [
    ...form.getAll(`${baseKey}[]`),
    ...form.getAll(baseKey),
  ].filter((x): x is File => x instanceof File && x.size >= 0);

  return fallback;
}
