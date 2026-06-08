export const useDeleteResultNotification = () => ({
  notify: async (..._args: any[]) => {},
  notifySuccess: () => {},
  notifyError: () => {},
});
export const useMutationResultNotification = useDeleteResultNotification;
export default useDeleteResultNotification;
