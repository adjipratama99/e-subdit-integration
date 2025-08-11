import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Confirmation from "../confirmation";
import { Modal } from "../modal";
import { fetchPost } from "@/lib/Fetcher";
import { toast } from "sonner";
import { AbsensiType, Penanganan, Pendidikan, Personel, ResponseTypes } from "@/types/general";
import { useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/useLoadingContext";
import { useSidebar } from "@/context/useSidebarContext";

export default function ActionTable({
    type,
    data,
    open,
    onOpenChange,
    queryKey,
    noUpdate = false,
    noDelete = false,
    content
}: {
    type: "personnel" | "pendidikan" | "lp-li" | "absensi",
    data: Pendidikan | Personel | Penanganan | AbsensiType,
    open: boolean,
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
    queryKey: string[]
    noDelete?: boolean
    noUpdate?: boolean
    content?: React.JSX.Element
}): React.JSX.Element {
    const { setLoading } = useLoading()
    const query = useQueryClient()
    const [clicked, setClicked] = useState<boolean>(false);
    const { toggle, close } = useSidebar()

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

    useEffect(() => {
        if(!open && clicked) {
            close()
            toggle()
        } else {
            if(clicked) toggle()
        }
    }, [open, clicked])
    
    return (
        <div className="flex items-center gap-2">
            {
                !noUpdate && (
                    <Modal
                        open={open}
                        onOpenChange={onOpenChange}
                        title={`Update ${ type }`}
                        className="sm:max-w-[calc(100%-80px)]"
                        trigger={<Button size="sm" type="button" variant="secondary" className="gap-2" onClick={() => setClicked(true)}><FaPencilAlt />Ubah</Button>}
                        content={content}
                    />
                )
            }
            {
                !noDelete && (
                    <Confirmation
                        trigger={<Button size="sm" type="button" variant="destructive" className="gap-2"><FaTrashAlt />Hapus</Button>}
                        onConfirm={handleDelete}
                    />
                )
            }
        </div>
    )
}