import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const tableName = process.env.NEXT_PUBLIC_PENANGANAN_LP_LI_NAME as string;


export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const params = await req.json();
  const action = params?.action || "READ";
  const offset = Number(params?.offset || 0);
  const limit = Number(params?.limit || 10);

  try {
    switch (action) {
      case "CREATE": {
        let dataLaporan = {...params, user_create: session?.user?.name};
        delete dataLaporan.action;

        const { data, error } = await supabase
          .from(tableName)
          .insert([dataLaporan])
          .select("*");

        if (error) throw error;

        return NextResponse.json({
          code: 0,
          content: data,
          message: "Penanganan LP & LI created successfully",
        });
      }

      case "READ": {
        const search = params?.search || "";
        const sort = params?.sort || { created_at: true };
        const key = Object.keys(sort)[0] as keyof typeof sort;
        const ascending = sort[key] !== false && sort[key] !== -1;
      
        const dateFrom = params?.dateFrom ? new Date(params.dateFrom) : null;
        const dateUntil = params?.dateUntil ? new Date(params.dateUntil) : null;
        const jenis = params?.jenis || null;
      
        const searchColumns = [
          "nomor",
          "jenis",
          "kronologis",
          "pasal",
          "status_proses",
          "catatan_hambatan"
        ];
      
        const buildQuery = (selectStr = "*", selectOpts = {}) => {
          let q = supabase.from(tableName).select(selectStr, selectOpts);
      
          // Apply search filter
          if (search) {
            const orFilter = searchColumns
              .map((col) => `${col}.ilike.%${search}%`)
              .join(",");
            q = q.or(orFilter);
          }
      
          // Apply date range filter
          if (dateFrom) {
            q = q.gte("tanggal", dateFrom.toISOString());
          }
          if (dateUntil) {
            q = q.lte("tanggal", dateUntil.toISOString());
          }
      
          // Apply jenis filter
          if (jenis) {
            q = q.eq("jenis", jenis);
          }

          if(session?.user?.name !== "admin") {
            q = q.eq("user_create", session?.user?.name);
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
        const { data, error } = await buildQuery()
          .order(key as string, { ascending })
          .range(offset, offset + limit - 1);
      
        if (error) throw error;
      
        return NextResponse.json({
          code: 0,
          content: {
            count,
            results: data || [],
          },
          message: "Penanganan LP & LI fetched successfully",
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
          message: "Penanganan LP & LI updated successfully",
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
          message: "Penanganan LP & LI deleted successfully",
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
