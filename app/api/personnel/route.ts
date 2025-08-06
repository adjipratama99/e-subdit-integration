import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Personel } from "@/types/general";

const tableName = process.env.NEXT_PUBLIC_PERSONNEL_NAME as string;

export async function POST(req: Request) {
  const params = await req.json();
  const action = params?.action || "READ";
  const offset = Number(params?.offset || 0);
  const limit = Number(params?.limit || 10);

  try {
    switch (action) {
      case "CREATE": {
        const { nama, jabatan, nrp, pangkat } = params;

        const { data, error } = await supabase
          .from(tableName)
          .insert([{ nama, jabatan, nrp, pangkat }])
          .select("*");

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: data,
          message: "Personel created successfully",
        });
      }

      case "READ": {
        const search = params?.search || "";
        const sort = params?.sort || { created_at: true };
        const key = Object.keys(sort)[0] as keyof typeof sort;
        const ascending = sort[key] !== false && sort[key] !== -1;

        const searchColumns = ["nama", "nrp", "jabatan", "pangkat"];

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
          const { count: _count, error } = await buildQuery("id", {
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
            ${ process.env.NEXT_PUBLIC_PERSONNEL_EDUCATION_NAME } (
              jenis,
              nama_sekolah,
              tahun_mulai
          )`)
          .order(key as string, { ascending })
          .range(offset, offset + limit - 1);

        const sortedData = [
            ...((data as unknown as Personel[])?.filter((item) => item.pendidikan?.length > 0) || [])
        ];

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: {
            count,
            results: ((params?.report) ? sortedData : data) || [],
          },
          message: "Personel fetched successfully",
        });
      }

      case "UPDATE": {
        const { id, updateData } = params;

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

        return NextResponse.json({
          code: 0,
          content: data,
          message: "Personel updated successfully",
        });
      }

      case "DELETE": {
        const { id } = params;

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
