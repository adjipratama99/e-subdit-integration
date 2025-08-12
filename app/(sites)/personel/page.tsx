"use client";

import { ServerTable } from "@/components/custom/data-table";
import { columns } from "./components/columns";
import useTableResponse from "@/hooks/useTableResponse";
import React, { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GET_LIST_PERSONNEL } from "@/constant/key";
import { PersonelFormContent } from "./components/insert-content";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { useSidebar } from "@/context/useSidebarContext";

export default function Dashboard(): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [clicked, setClicked] = useState<boolean>(false);
    const [sort, setSort] = useState<{[key: string]: 1 | -1}>({ created_at: -1 })
    const [search, setSearch] = useState<string>("")
    const { toggle, close, isOpen } = useSidebar()

    const {
        data,
        isLoading,
        offset,
        limit,
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
        setSearch(search)
    }, [])

    useEffect(() => {
        if(!open && clicked && isOpen) {
            close()
            toggle()
        } else {
            if(clicked && isOpen) toggle()
        }
    }, [open, clicked])

    return (
        <div className="p-4">
            <div className="flex w-full min-w-0 justify-between items-center flex-wrap gap-4 mb-4">
                <h1 className="text-xl font-bold flex-shrink-0">Data Personel</h1>
                <div className="flex-shrink-0">
                    <Modal
                        title="Tambah Personel"
                        trigger={
                            <Button size="sm" type="button" onClick={() => setClicked(true)}>
                                <FaPlus className="mr-2" />
                                Tambah Personel
                            </Button>
                        }
                        className="sm:max-w-[calc(100%-80px)]"
                        open={open}
                        onOpenChange={setOpen}
                        content={<PersonelFormContent onSuccess={() => setOpen(false)} />}
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
