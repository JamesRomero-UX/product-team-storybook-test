export const getEnv = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${name} is not defined`);
};

export const getOptionalEnv = (name: string): string | undefined =>
  process.env[name] ?? undefined;
