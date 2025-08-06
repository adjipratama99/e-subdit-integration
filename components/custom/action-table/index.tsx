import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Confirmation from "../confirmation";
import { Modal } from "../modal";
import { fetchPost } from "@/lib/Fetcher";
import { toast } from "sonner";
import { AbsensiType, Penanganan, Pendidikan, Personel, ResponseTypes } from "@/types/general";
import { useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/useLoadingContext";

export default function ActionTable({
    type,
    data,
    open,
    onOpenChange,
    queryKey,
    content
}: {
    type: "personnel" | "pendidikan",
    data: Pendidikan | Personel | Penanganan,
    open: boolean,
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
    queryKey: string[]
    content: React.JSX.Element
}): React.JSX.Element {
    const { setLoading } = useLoading()
    const query = useQueryClient()

    const handleDelete = async () => {
        setLoading(true)

        const response = await fetchPost({
            url: `/api/${ type }`,
            body: { action: "DELETE", id: data.id }
        }) as ResponseTypes

        setLoading(false)

        if(response.code === 0) {
            toast.success(response.message)
            query.invalidateQueries({ queryKey })
        }
    }
    
    return (
        <div className="flex items-center gap-2">
            <Modal
                open={open}
                onOpenChange={onOpenChange}
                title={`Update ${ type }`}
                trigger={<Button size="sm" type="button" variant="secondary" className="gap-2"><FaPencilAlt />Ubah</Button>}
                content={content}
            />
            <Confirmation
                trigger={<Button size="sm" type="button" variant="destructive" className="gap-2"><FaTrashAlt />Hapus</Button>}
                onConfirm={handleDelete}
            />
        </div>
    )
}