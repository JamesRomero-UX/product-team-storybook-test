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

  // TypeScript cannot narrow a generic conditional type (TFlag extends true ? T | undefined : T) from
  // a runtime guard — the assertion bridges the gap after the undefined check above has already ensured safety.
  return value as ToggleableMaybeType<string, TFlag>;
};

export const getEnvBoolean = (
  name: string,
  allowUndefined?: boolean
): boolean => {
  return getEnv(name, allowUndefined) === 'true';
};
