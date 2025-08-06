import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const tableName = process.env.NEXT_PUBLIC_ATTENDANCE_NAME as string

export async function POST(req: Request) {
  const params = await req.json();
  const action = params?.action || "READ";
  const offset = Number(params?.offset || 0);
  const limit = Number(params?.limit || 10);

  try {
    switch (action) {
      case "CREATE": {
        const { personel_id, jam_datang, jam_pulang, status, tanggal } = params;

        const { data, error } = await supabase
          .from(tableName)
          .insert([{ personel_id, jam_datang, jam_pulang, status, tanggal }])
          .select("*");

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: data,
          message: "Absensi created successfully",
        });
      }

      case "READ": {
        const search = params?.search || "";
        const sort = params?.sort || { created_at: true };
        const key = Object.keys(sort)[0] as keyof typeof sort;
        const ascending = sort[key] !== false && sort[key] !== -1;

        const searchColumns = ["personel.nama", "status"];

        const buildQuery = (selectStr = "*", selectOpts = {}) => {
          let q = supabase.from(tableName).select(selectStr, selectOpts);
        
          if (search) {
            const orFilter = searchColumns
              .map((col) => `${col}.ilike.%${search}%`)
              .join(",");
            q = q.or(orFilter);
          }
        
          return q;
        };
        
        // Ambil count
        let count: number | null = null;
        let countError = null;
        
        try {
          const { count: _count, error } = await buildQuery(`*,
            ${ process.env.NEXT_PUBLIC_PERSONNEL_NAME }:personel_id (
              id,
              nama,
              nrp,
              pangkat,
              jabatan
            )`, {
            count: "exact",
            head: false, // head: false biar compatible sama or()
          });
        
          count = _count;
          countError = error;
        } catch (err) {
          console.error("Error count search:", err);
        }

        if (countError) throw countError;

        // Fetch paginated & sorted data
        const { data, error } = await buildQuery(`*,
            personel:personel_id (
              id,
              nama,
              nrp,
              pangkat,
              jabatan
          )`)
          .order(key as string, { ascending })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: {
            count,
            results: data || [],
          },
          message: "Personel fetched successfully",
        });
      }

      case "UPDATE": {
        const { id, ...updateData } = params;

        if (!id) {
          return NextResponse.json({
            code: -1,
            message: "ID is required for update",
          }, { status: 400 });
        }

        const { data, error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq("id", id)
          .select("*");

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: data,
          message: "Absensi updated successfully",
        });
      }

      case "DELETE": {
        const { id } = params;

        if (!id) {
          return NextResponse.json({
            code: -1,
            message: "ID is required for deletion",
          }, { status: 400 });
        }

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id);

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          message: "Absensi deleted successfully",
        });
      }

      default:
        return NextResponse.json({
          code: -1,
          message: `Unknown action: ${action}`,
        }, { status: 400 });
    }

  } catch (e: any) {
    console.error("[API ABSENSI ERROR]", e.message);
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
