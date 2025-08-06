import React, { useState } from "react";
import { Modal } from "../modal";
import { FaExclamationCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

type ConfirmationTypes = {
    onConfirm: () => void;
    title?: string;
    message?: string;
    className?: string;
    trigger: React.JSX.Element
}

export default function Confirmation({
    onConfirm,
    title = "Confirm delete",
    message = "Yakin ingin menghapus ini ? Aksi ini tidak bisa dibatalkan.",
    trigger,
    className,

}: ConfirmationTypes): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false)

    const handleActionConfirm = () => {
        onConfirm()
        setOpen(false)
    }

    return (
        <Modal
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title={title}
            content={<ConfirmContent onConfirm={handleActionConfirm} className={className} onClose={setOpen} message={message} />}
        />

    )
}

function ConfirmContent({ onConfirm, onClose, message }: { 
    onConfirm: () => void;
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
    message: string;
}): React.JSX.Element {
    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaExclamationCircle size={72} className="text-red-500" />
                <div className="text-center">{ message }</div>
                <div className="flex items-center gap-4">
                    <Button type="button" variant="destructive" onClick={onConfirm}>Yakin</Button>
                    <Button type="button" onClick={() => onClose(false)} variant="outline">Batalkan</Button>
                </div>
            </div>
        </div>
    )
}