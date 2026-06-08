type ToggleableMaybeType<TType, TFlag extends boolean> = TFlag extends true
  ? TType | undefined
  : TType;

export const getEnv = <TFlag extends boolean = false>(
  name: string,
  allowUndefined?: TFlag
): ToggleableMaybeType<string, TFlag> => {
  const value = process.env[name];

  if (value === undefined && !allowUndefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value as ToggleableMaybeType<string, TFlag>;
};

export const getEnvBoolean = (
  name: string,
  allowUndefined?: boolean
): boolean => {
  return getEnv(name, allowUndefined) === 'true';
};

export const parseEnvJson = <T = unknown>(
  key: string,
  required: boolean = false,
  defaultValue: T | null = null
) => {
  const raw = getEnv(key, !required);
  if (!raw) {
    return defaultValue;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Failed to parse ${key}: ${(error as Error).message}`);
  }
};
