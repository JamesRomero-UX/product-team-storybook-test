export const useHasPermissionQuery = (_perm?: string, _arg?: any, _opt?: any) => ({
  hasPermission: true,
  loading: false,
  error: undefined,
});
export const useHasPermission = useHasPermissionQuery;
export default useHasPermissionQuery;
