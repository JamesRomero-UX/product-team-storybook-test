import { z } from 'zod';

export const providerNameSchema = z.enum(['ascent']);
export type ProviderName = z.infer<typeof providerNameSchema>;
