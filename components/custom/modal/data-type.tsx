"use client"

import { Label } from "@/components/custom/form/label";
import { Select } from "@/components/custom/form/select";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { DataType } from "@/constant/options";
import React, { useState } from "react";
import { toast } from "sonner";
import { changeTypeData, toggleClearedData, toggleOpen } from "@/redux/slices/reportSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { typeDatas } from "@/types/general";
import { useSession } from "next-auth/react";

type DataTypes = {
    open: boolean;
}

export default function ModalTypeData({ open }: DataTypes): React.JSX.Element {
    return (
        <Modal
            hideX
            open={open}
            content={<ModalContent />}
            title="Pilih sumber data"
        />
    )
}

function ModalContent() {
    const { data: session } = useSession()
    const dispatch = useAppDispatch()
    const { typeData } = useAppSelector((state) => state.report)
    const [selectedData, setSelectedData] = useState<typeDatas>(typeData!);

    const handleSubmit = () => {
        if(!selectedData) {
            toast.warning("Sumber data belum dipilih.")
            return
        }
        
        dispatch(changeTypeData(selectedData))
        dispatch(toggleClearedData(false))
        dispatch(toggleOpen())
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <Label isRequired value="Sumber Data" />
                <Select
                    placeholder="Pilih sumber data"
                    options={(session?.user?.name === "admin") ? DataType : DataType.filter((item) => item.value === "lp-li")}
                    onChange={(val) => setSelectedData(val as typeDatas)}
                    value={selectedData}
                    isModal
                />
            </div>
            <Button type="button" className="w-full" onClick={() => handleSubmit()}>Submit</Button>
        </div>
    )
}