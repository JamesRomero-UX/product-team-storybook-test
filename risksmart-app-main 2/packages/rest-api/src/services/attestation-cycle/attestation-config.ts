import z from 'zod';
export const attestationConfigIdSchema = z
  .string()
  .uuid()
  .brand('AttestationConfigId');

export type AttestationConfigId = z.infer<typeof attestationConfigIdSchema>;

export const attestationConfigSchema = z.object({
  id: attestationConfigIdSchema,
  timeLimitMs: z.number().nullish(),
});

export type AttestationConfig = Readonly<
  z.infer<typeof attestationConfigSchema>
>;
