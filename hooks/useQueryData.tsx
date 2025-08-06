
import { useLoading } from '@/context/useLoadingContext';
import { fetchPost } from '@/lib/Fetcher';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

type FetchResponse<T = any> = {
  code: number;
  message: string;
  content?: T;
};

type UseCustomQueryProps<TData = any, TError = unknown> = {
  queryKey: (string|number|object)[];
  url: string;
  params?: Record<string, any>;
  callbackResult?: (res: FetchResponse) => TData;
  useExampleData?: boolean | (() => TData[]);
  refetchInterval?: number;
  makeLoading?: boolean;
} & Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>;

export function useCustomQuery<TData = any, TError = unknown>({
  queryKey,
  url,
  params = {},
  callbackResult,
  useExampleData,
  refetchInterval,
  makeLoading = false,
  ...props
}: UseCustomQueryProps<TData, TError>) {
  const { setLoading } = useLoading()
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      if(makeLoading) {
        setLoading(true)
      }

      if (useExampleData) {
        return typeof useExampleData === 'function'
          ? await getExampleData(useExampleData)
          : await getExampleData();
      }

      const response = await fetchPost({ url, body: params }) as FetchResponse;

      if(makeLoading) {
        setLoading(false)
      }

      if (response.code !== 0) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      return typeof callbackResult === 'function'
        ? callbackResult(response)
        : (response as any);
    },
    refetchInterval,
    ...props,
  });

  return query;
}

type UseCustomMutationProps<TData = any, TVariables = any, TError = unknown> = {
  mutationKey: string[];
  url: string;
  params?: Record<string, any>;
  makeLoading?: boolean;
  callbackResult?: (res: FetchResponse) => TData;
} & Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'mutationKey'>;

export function useCustomMutation<TData = any, TVariables = any, TError = unknown>({
  mutationKey,
  url,
  params = {},
  callbackResult,
  makeLoading = false,
  ...props
}: UseCustomMutationProps<TData, TVariables, TError>) {
  const mutation = useMutation<TData, TError, TVariables>({
    mutationKey,
    mutationFn: async (extraParams: TVariables) => {
      const response = await fetchPost({ url, body: { ...params, ...extraParams } }) as FetchResponse;

      if (response.code === 0) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }

      return typeof callbackResult === 'function'
        ? callbackResult(response)
        : (response as any);
    },
    ...props,
  });

  return mutation;
}

async function getExampleData<T = any>(exampleData?: () => T[]): Promise<FetchResponse<T[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const defaultContent = [
        { _id: 1, name: 'John Doe', msisdn: '6285123456789', nik: '1234567890123456', vehicle: 'Toyota' },
        { _id: 2, name: 'Jane Smith', msisdn: '6285123456788', nik: '6543210987654321', vehicle: 'Honda' },
        { _id: 3, name: 'Alice Johnson', msisdn: '6285123456787', nik: '1122334455667788', vehicle: 'Suzuki' },
      ];

      resolve({
        code: 0,
        message: 'Success',
        content: exampleData ? exampleData() : defaultContent as T[],
      });
    }, 200);
  });
}
