"use client";

import { ServerTable } from "@/components/custom/data-table";
import { columns } from "./components/columns";
import useTableResponse from "@/hooks/useTableResponse";
import React, { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GET_LIST_PERSONNEL } from "@/constant/key";
import { PersonelFormContent } from "./components/insert-content";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

export default function Dashboard(): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [sort, setSort] = useState<{[key: string]: 1 | -1}>({})
    const [search, setSearch] = useState<string>("")

    const {
        data,
        isLoading,
        onPaginationChange,
        pagination,
    } = useTableResponse({
        rowEachPage: 10,
        queryKey: [GET_LIST_PERSONNEL, sort, search],
        url: "/api/personnel",
        params: {
            action: "READ",
            ...(Object.keys(sort).length && { sort }),
            ...(search && { search })
        },
    });

    const handleSearch = useCallback((search: string) => {
        console.log(search)
        setSearch(search)
    }, [])

    return (
        <div className="p-4">
            <div className="flex w-full min-w-0 justify-between items-center flex-wrap gap-4 mb-4">
                <h1 className="text-xl font-bold flex-shrink-0">Data Personel</h1>
                <div className="flex-shrink-0">
                    <Modal
                        title="Tambah Personel"
                        trigger={
                            <Button size="sm" type="button">
                                <FaPlus className="mr-2" />
                                Tambah Personel
                            </Button>
                        }
                        open={open}
                        onOpenChange={setOpen}
                        content={<PersonelFormContent onSuccess={() => setOpen(false)} />}
                    />
                </div>
            </div>

            <ServerTable
                columns={columns as ColumnDef<object, any>[]}
                data={data?.content?.results ?? []}
                pageCount={Math.ceil((data?.content?.count || 0) / pagination.pageSize)}
                total={data?.content?.count ?? 0}
                onSortChange={({ key, desc }) => {
                    setSort({[key]: desc ? -1 : 1})
                }}
                pagination={pagination}
                onSearch={handleSearch}
                onPaginationChange={onPaginationChange}
                isLoading={isLoading}
            />
        </div>
    );
}
