export const useIsFeatureFlagEnabled = (_flag?: string): boolean => true;
export const useIsFeatureFlagEnabledLazy = () => (_flag?: string) => true;
export default useIsFeatureFlagEnabled;
