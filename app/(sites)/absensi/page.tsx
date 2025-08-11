"use client";

import { ServerTable } from "@/components/custom/data-table";
import { columns } from "./components/columns";
import useTableResponse from "@/hooks/useTableResponse";
import React, { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GET_LIST_ABSENSI } from "@/constant/key";
import { useAbsensiRealtime } from "@/hooks/useAbsensiRealtime";
import { AbsensiFormContent } from "./components/insert-content";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

export default function Dashboard(): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [sort, setSort] = useState<{[key: string]: 1 | -1}>({})
    const [search, setSearch] = useState<string>("")

    const {
        data,
        offset,
        limit,
        isLoading,
        onPaginationChange,
        pagination,
        refetch,
    } = useTableResponse({
        rowEachPage: 10,
        queryKey: [GET_LIST_ABSENSI, sort, search],
        url: "/api/absensi",
        params: {
            action: "READ",
            ...(Object.keys(sort).length && { sort }),
            ...(search && { search })
        },
    });

    useAbsensiRealtime(() => {
        console.log("[Realtime] Changes detected, refetching data...");
        refetch();
    });

    const handleSearch = useCallback((search: string) => {
        setSearch(search)
    }, [])

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
                offset={offset}
                limit={limit}
                columns={columns as ColumnDef<object, any>[]}
                data={data?.content?.results ?? []}
                total={data?.content?.count ?? 0}
                onSearch={handleSearch}
                pagination={pagination}
                onDataChange={onPaginationChange}
                isLoading={isLoading}
            />
        </div>
    );
}
