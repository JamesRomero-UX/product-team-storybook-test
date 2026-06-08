import z from 'zod';

export const attestationCycleIdSchema = z
  .string()
  .uuid()
  .brand('AttestationCycleId');

export type AttestationCycleId = z.infer<typeof attestationCycleIdSchema>;
