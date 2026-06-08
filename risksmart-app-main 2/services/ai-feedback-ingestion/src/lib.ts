import { ConfigurationError } from './domain/errors';

export const getEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new ConfigurationError(
      `Environment variable ${name} is not defined`,
      {
        variable: name,
      }
    );
  }

  return value;
};

export const getOptionalEnv = (name: string): string | undefined => {
  return process.env[name];
};

export const isLocalDevelopment = (): boolean => {
  return getOptionalEnv('IS_LOCAL') === 'true';
};
