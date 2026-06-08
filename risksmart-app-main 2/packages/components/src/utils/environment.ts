export const getEnv = (
  name: `REACT_APP_${string}`,
  allowUndefined = false
): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (import.meta as any).env[name];
  if (value === undefined && !allowUndefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value;
};
