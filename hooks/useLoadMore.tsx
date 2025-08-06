import { fetchPost } from '@/lib/Fetcher'
import { FetchPostParams } from '@/types/general'
import { useInfiniteQuery } from '@tanstack/react-query'

type UseLoadMoreParams<TParams> = {
    rowEachPage: number
    queryKey: (string|number|object)[]
    url: string
    addParams?: TParams
    intervalMs?: number | false
}

type APIResponse<T> = {
    content?: {
        count?: number
        results?: T[]
    }
}

type PageData<T> = {
    data: T[]
    nextId: number | null
    previousId: number
}

export default function useLoadMore<TData = any, TParams = Record<string, any>>({
    rowEachPage,
    queryKey,
    url,
    addParams,
    intervalMs
}: UseLoadMoreParams<TParams>) {
    const {
        status,
        data,
        error,
        isLoading,
        isFetching,
        isFetchingNextPage,
        isFetchingPreviousPage,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
    } = useInfiniteQuery<PageData<TData>, Error>({
        queryKey,
        queryFn: async ({ pageParam = 0 }) => {
            const params = {
                offset: pageParam,
                limit: rowEachPage,
                ...(addParams || {})
            }

            const response: APIResponse<TData> = await fetchPost({
                url,
                body: params
            } as FetchPostParams<TParams>)

            const total = response?.content?.count || 0
            const results = response?.content?.results || []
            const hasNext = (pageParam as number + rowEachPage) < total

            return {
                data: results,
                nextId: hasNext ? (pageParam as number + rowEachPage) : null,
                previousId: Math.max(pageParam as number - rowEachPage, 0)
            }
        },
        initialPageParam: 0,
        refetchInterval: intervalMs || false,
        getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
        getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
    })

    return {
        status,
        data,
        error,
        isLoading,
        isFetching,
        isFetchingNextPage,
        isFetchingPreviousPage,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage
    }
}
