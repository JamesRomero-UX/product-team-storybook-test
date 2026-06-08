export const getEnvVariable = (
  name: string,
  defaultValue: string | undefined = undefined
) => {
  const value: string | undefined = process.env[name] ?? defaultValue;
  if (!value) {
    throw Error(`${name} must be defined in environment`);
  }

  return value;
};
