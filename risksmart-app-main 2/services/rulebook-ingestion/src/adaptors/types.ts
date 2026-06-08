import type z from 'zod';

export type TypesafeTransform<T extends z.ZodTypeAny> = {
  [K in keyof z.input<T>]: unknown;
};
