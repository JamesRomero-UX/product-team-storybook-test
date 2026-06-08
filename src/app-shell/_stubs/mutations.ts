// Catch-all stub for @/hooks/mutations and @/hooks/mutations/*
const noop = async () => ({ data: undefined } as any);
const useMutation = () => [noop, { loading: false, error: undefined, data: undefined }];

export default new Proxy({}, { get: () => useMutation });

export const useDeleteRisk = useMutation;
export const useCreateRisk = useMutation;
export const useUpdateRisk = useMutation;
