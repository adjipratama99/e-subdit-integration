'use client'

import {
    QueryClient,
    QueryClientProvider,
    HydrationBoundary
} from '@tanstack/react-query'
import React from 'react'

export default function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    })

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}