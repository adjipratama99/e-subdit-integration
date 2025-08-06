"use client"

import React, { createContext, useContext, useState } from "react";
import FullPageLoader from "@/hooks/useLoadingScreen";

type LoadingContextType = {
    setLoading: (val: boolean) => void;
    loading: boolean
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading harus dipakai di dalam <LoadingProvider>");
    }
    return context;
};

export const LoadingProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {loading && <FullPageLoader />}
            {children}
        </LoadingContext.Provider>
    );
};
