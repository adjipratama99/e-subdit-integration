import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Pendidikan, Personel } from "@/types/general";
import { getAllFiles } from "@/lib/toFormData";

const tableName = process.env.NEXT_PUBLIC_PERSONNEL_NAME as string;
const tablePendidikanName = process.env.NEXT_PUBLIC_PERSONNEL_EDUCATION_NAME as string;

export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  let params = null;
  let action = null;
  if (!ctype.includes("multipart/form-data")) {
    params = await req.json();
    action = params?.action || "READ";
  } else {
    params = await req.formData();
    action = String(params.get("action") || "CREATE");
  }

  try {
    switch (action) {
      case "CREATE": {
        const nama = String(params.get("nama") || "");
        const nrp = String(params.get("nrp") || "");
        const pangkat = String(params.get("pangkat") || "");
        const jabatan = String(params.get("jabatan") || "");
        const hasSkep = Boolean(params.get("hasSkep"));
        const hasCertified = Boolean(params.get("hasCertified"));
        const is_detective = Boolean(params.get("is_detective"));

        const skepFiles = [
          ...getAllFiles(params, "skep")
        ];
        const certifiedFiles = [
          ...getAllFiles(params, "certified")
        ];

        const { data: personel, error: personelError } = await supabase
          .from(tableName)
          .insert([{ nama, jabatan, nrp, pangkat, skep: (hasSkep ? skepFiles[0].name : null), certified: (hasCertified ? certifiedFiles[0].name : null), is_detective }])
          .select("*");

        if (personelError) throw personelError;

        const pendidikan = collectPendidikan(params, personel[0]);

        const { data: pendidikanData, error: pendidikanError } = await supabase
          .from(tablePendidikanName)
          .insert(pendidikan)
          .select("*");

        if (pendidikanError) throw pendidikanError;

        const [skepUrls, certifiedUrls] = await Promise.all([
          skepFiles.length ? uploadMany(`skep/${nrp || "anon"}`, skepFiles, process.env.BUCKET_SKEP_NAME!) : [],
          certifiedFiles.length
            ? uploadMany(`certified/${nrp || "anon"}`, certifiedFiles, process.env.BUCKET_CERTIFIED_NAME!)
            : [],
        ]);

        return NextResponse.json({
          code: 0,
          content: {...(personel && personel.length ? {...personel[0]} : []), pendidikan: pendidikanData, skepUrls, certifiedUrls },
          message: "Personel created successfully",
        });
      }

      case "READ": {
        const offset = Number(params?.offset || 0);
        const limit = Number(params?.limit || 10);
        const search = params?.search || "";
        const sort = params?.sort || { created_at: true };
        const key = Object.keys(sort)[0] as keyof typeof sort;
        const ascending = sort[key] !== false && sort[key] !== -1;
      
        const searchColumns = ["nama", "nrp", "jabatan", "pangkat"];
      
        const buildQuery = (selectStr = "*", selectOpts = {}) => {
          let q = supabase.from(tableName).select(selectStr, selectOpts);
          if (search) {
            const orFilter = searchColumns.map((col) => `${col}.ilike.%${search}%`).join(",");
            q = q.or(orFilter);
          }
          return q;
        };
      
        // Count
        let count: number | null = null;
        let countError = null;
        try {
          const { count: _count, error } = await buildQuery("id", { count: "exact", head: false });
          count = _count; countError = error;
        } catch (err) {
          console.error("Error count search:", err);
        }
        if (countError) throw countError;
      
        // Data
        const { data, error } = await buildQuery(`*,
            ${process.env.NEXT_PUBLIC_PERSONNEL_EDUCATION_NAME} (
              id,
              jenis,
              nama_sekolah,
              tahun_mulai,
              tahun_selesai
            )`)
          .order(key as string, { ascending })
          .range(offset, offset + limit - 1);
      
        if (error) throw error;
      
        // Enrich dengan file URLs berdasarkan nrp, batasi concurrency untuk hemat memori
        const rows = (data ?? []) as any[];
        const concurrency = 8; // atur sesuai kebutuhan
        const enriched: any[] = [];
        for (let i = 0; i < rows.length; i += concurrency) {
          const chunk = rows.slice(i, i + concurrency);
          const part = await Promise.all(
            chunk.map(async (row: any) => {
              const nrp = row?.nrp?.toString() || "anon";
              const [skepUrls, certifiedUrls] = await Promise.all([
                listPublicUrlsByPrefix(`skep/${nrp}`, 'skep'),
                listPublicUrlsByPrefix(`certified/${nrp}`, 'certified'),
              ]);
              return {
                ...row,
                skep_urls: skepUrls,
                certified_urls: certifiedUrls,
              };
            })
          );
          enriched.push(...part);
        }
      
        const sortedData = [
          ...(enriched as any[])?.filter((item) => item.pendidikan?.length > 0) || [],
        ];
      
        return NextResponse.json({
          code: 0,
          content: {
            count,
            results: (params?.report ? sortedData : enriched) || [],
          },
          message: "Personel fetched successfully",
        });
      }      

      case "UPDATE": {
        const id = String(params.get("id") || "");
        const nama = String(params.get("nama") || "");
        const nrp = String(params.get("nrp") || "");
        const pangkat = String(params.get("pangkat") || "");
        const jabatan = String(params.get("jabatan") || "");
        const hasSkep = Boolean(params.get("hasSkep"));
        const hasCertified = Boolean(params.get("hasCertified"));
        const is_detective = Boolean(params.get("is_detective"));

        const skepFiles = [
          ...getAllFiles(params, "skep")
        ];
        const certifiedFiles = [
          ...getAllFiles(params, "certified")
        ];

        const updateData = {
          nama,
          nrp,
          pangkat,
          jabatan,
          skep: (hasSkep ? skepFiles[0]?.name : null),
          certified: (hasCertified ? certifiedFiles[0]?.name : null),
          is_detective
        }

        if (!id) {
          return NextResponse.json(
            {
              code: -1,
              message: "ID is required for update",
            },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from(tableName)
          .update({ ...updateData, updated_at: new Date() })
          .eq("id", id)
          .select("*");

        if (error) throw error;

        const pendidikan = collectPendidikan(params, data[0]);

        let pendidikanData = [];

        try {
          for (const pend of pendidikan) {
            const { data, error } = await supabase
            .from(tablePendidikanName)
            .upsert(pend)
            .eq("id", pend.id)
            .select("*");

            console.log("Pendidikan upserted:", error);

            pendidikanData.push(data![0]);
          }
        } catch (err) {
          console.error("Error updating pendidikan:", err);
          return NextResponse.json(
            {
              code: -1,
              message: "Failed to update pendidikan",
            },
            { status: 500 }
          );
        }

        const [skepUrls, certifiedUrls] = await Promise.all([
          skepFiles.length ? uploadMany(`skep/${nrp || "anon"}`, skepFiles, process.env.BUCKET_SKEP_NAME!) : [],
          certifiedFiles.length
            ? uploadMany(`certified/${nrp || "anon"}`, certifiedFiles, process.env.BUCKET_CERTIFIED_NAME!)
            : [],
        ]);

        return NextResponse.json({
          code: 0,
          content: {
            ...(data && data.length ? { ...data[0] } : []),
            pendidikan: pendidikanData,
            skep_urls: skepUrls,
            certified_urls: certifiedUrls,
          },
          message: "Personel updated successfully",
        });
      }

      case "DELETE": {
        const { id, isStorage, type, files } = params;

        if(isStorage) {
          for (const file of files) {
            await deleteFileFromStorage(type!, `${type}/${file}`);

            return NextResponse.json({
              code: 0,
              message: "Dokumen telah dihapus.",
            });
          }
        }

        if (!id) {
          return NextResponse.json(
            {
              code: -1,
              message: "ID is required for deletion",
            },
            { status: 400 }
          );
        }

        const { error } = await supabase.from(tableName).delete().eq("id", id);

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          message: "Personel deleted successfully",
        });
      }

      default:
        return NextResponse.json(
          {
            code: -1,
            message: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (e: any) {
    console.error("[API Personel ERROR]", e.message);
    return NextResponse.json(
      {
        code: -1,
        message: e.message || "Something went wrong",
        content: null,
      },
      { status: 500 }
    );
  }
}

async function uploadMany(prefix: string, files: File[], bucketName: string) {
  const urls: string[] = [];
  for (const f of files) {
    const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}-${f.name}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, f, { contentType: f.type, upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function collectPendidikan(form: FormData, data: Personel) {
  // 3) JSON langsung
  const rawJson = form.get("pendidikan");
  if (rawJson && typeof rawJson === "string") {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // 1) indices: pendidikan[0][jenis]
  const arrByIdx: Record<number, any> = {};
  // 2) brackets: pendidikan[][jenis] -> kita kumpulin by urutan kemunculan
  const orderBuckets: any[] = []; // tiap objek dibuat saat kita temukan field pertama

  // buat counter untuk track urutan objek pada pola brackets
  const seenCounts: Record<string, number> = {};

  for (const [k, v] of form.entries()) {
    const val = String(v);

    // indices
    let m = k.match(/^pendidikan\[(\d+)\]\[(\w+)\]$/);
    if (m) {
      const idx = Number(m[1]);
      const field = m[2];
      arrByIdx[idx] ??= {
        personel_id: data.id,
        jenis: "",
        nama_sekolah: "",
        tahun_mulai: "",
        tahun_selesai: "",
      };
      arrByIdx[idx][field] = val;
      continue;
    }

    // brackets (tanpa index)
    m = k.match(/^pendidikan\[\]\[(\w+)\]$/);
    if (m) {
      const field = m[1];
      // urutannya diasumsikan konsisten per objek.
      // kita distribusikan berdasarkan hitungan field yang sama.
      const i = seenCounts[field] ?? 0;
      seenCounts[field] = i + 1;

      orderBuckets[i] ??= {
        jenis: "",
        nama_sekolah: "",
        tahun_mulai: "",
        tahun_selesai: "",
      };
      orderBuckets[i][field] = val;
      continue;
    }
  }

  const fromIndices = Object.keys(arrByIdx)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => arrByIdx[Number(k)]);

  const result = fromIndices.length ? fromIndices : orderBuckets;
  return result.filter(Boolean);
}

async function listPublicUrlsByPrefix(prefix: string, BUCKET: string) {
  // prefix contoh: "skep/32132131" atau "certified/32132131"
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) throw error;

  // item folder biasanya metadata null; file punya metadata
  const files = (data || []).filter((it: any) => it?.metadata);
  return files.map((f: any) => {
    const path = `${prefix}/${f.name}`;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  });
}

async function deleteFileFromStorage(bucketName: string, filePath: string) {
  if (!bucketName || !filePath) {
    throw new Error("Bucket name and file path are required");
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]); // remove() menerima array path

  if (error) {
    console.error("❌ Error deleting file:", error.message);
    throw error;
  }

  console.log(`✅ File deleted: ${bucketName}/${filePath}`);
  return true;
}
