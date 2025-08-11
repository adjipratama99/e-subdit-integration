"use client"

import React from "react";
import usePagination from "./usePagination";
import { useCustomQuery } from "./useQueryData";
import { ResponseTableTypes } from "@/types/general";

type TableResponseType = {
    rowEachPage: number;
    queryKey: (string|number|object)[];
    params: {
        [key: string]: string | object | number | boolean;
    },
    url: string;
}

type TableResponseHooksType = {
    data: ResponseTableTypes;
    onPaginationChange: React.Dispatch<React.SetStateAction<{
        pageIndex: number;
        pageSize: number;
    }>>;
    pagination: {
        pageIndex: number;
        pageSize: number;
    }
    offset: number;
    limit: number;
    isLoading: boolean;
    refetch: () => void;
}

export default function useTableResponse({
    rowEachPage,
    queryKey,
    params,
    url
}: TableResponseType): TableResponseHooksType {
    const {
        offset,
        limit,
        onPaginationChange,
        pagination
    } = usePagination(rowEachPage)

    const { data, isLoading, refetch } = useCustomQuery({
        queryKey: [...queryKey, offset, limit],
        params: {...params, offset, limit},
        url
    })

    return {
        data,
        isLoading,
        offset,
        limit,
        onPaginationChange,
        refetch,
        pagination
    }
}