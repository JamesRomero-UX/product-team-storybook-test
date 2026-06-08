export const getEnv = (name: string, defaultValue?: string): string => {
  const value = process.env[name];

  if (value === undefined && defaultValue !== undefined) {
    return defaultValue;
  }

  if (value !== undefined) {
    return value;
  }

  throw new Error(`Environment variable ${name} is not defined`);
};
export const getOptionalEnv = (name: string): string | undefined => {
  return process.env[name];
};

export const getEnvBoolean = (
  name: string,
  allowUndefined?: boolean
): boolean => {
  const value = process.env[name];
  if (value === undefined && !allowUndefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value === 'true';
};
