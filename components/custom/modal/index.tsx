"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface ModalProps {
    title: string;
    trigger?: ReactNode;
    content: ReactNode;
    open: boolean;
    onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>
    subTitle?: string;
    footer?: ReactNode;
    className?: string;
    hideX?: boolean;
    closeButton?: ReactNode;
}

export function Modal({
    trigger,
    title,
    subTitle,
    content,
    footer,
    className,
    closeButton,
    hideX = false,
    ...props
}: ModalProps) {
    return (
        <Dialog {...props}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={cn("sm:max-w-[425px]", className, hideX ? "[&>button]:hidden" : "")}>
                <DialogHeader>
                    <DialogTitle className="capitalize">{title}</DialogTitle>
                    {subTitle && <DialogDescription>{subTitle}</DialogDescription>}
                </DialogHeader>
                {content}
                {footer && <DialogFooter>{footer}</DialogFooter>}
                {closeButton && <DialogClose>{closeButton}</DialogClose>}
            </DialogContent>
        </Dialog>
    );
}
