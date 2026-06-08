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

export const getOptionalEnv = (name: string): string | undefined => {
  return process.env[name];
};
