"use client";

import { ServerTable } from "@/components/custom/data-table";
import { columns } from "./components/columns";
import useTableResponse from "@/hooks/useTableResponse";
import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GET_LIST_ABSENSI } from "@/constant/key";
import { useAbsensiRealtime } from "@/hooks/useAbsensiRealtime";
import { AbsensiFormContent } from "./components/insert-content";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

export default function Dashboard(): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false);

    const {
        data,
        isLoading,
        onPaginationChange,
        pagination,
        refetch,
    } = useTableResponse({
        rowEachPage: 10,
        queryKey: [GET_LIST_ABSENSI],
        url: "/api/absensi",
        params: { action: "READ" },
    });

    useAbsensiRealtime(() => {
        console.log("[Realtime] Changes detected, refetching data...");
        refetch();
    });

    return (
        <div className="p-4">
            <div className="flex w-full min-w-0 justify-between items-center flex-wrap gap-4 mb-4">
                <h1 className="text-xl font-bold flex-shrink-0">Data Absensi</h1>
                <div className="flex-shrink-0">
                    <Modal
                        title="Tambah Absensi"
                        trigger={
                            <Button size="sm" type="button">
                                <FaPlus className="mr-2" />
                                Tambah Absensi
                            </Button>
                        }
                        open={open}
                        onOpenChange={setOpen}
                        content={<AbsensiFormContent onSuccess={() => setOpen(false)} />}
                    />
                </div>
            </div>

            <ServerTable
                columns={columns as ColumnDef<object, any>[]}
                data={data?.content?.results ?? []}
                pageCount={Math.ceil((data?.content?.count || 0) / pagination.pageSize)}
                total={data?.content?.count ?? 0}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                isLoading={isLoading}
            />
        </div>
    );
}
