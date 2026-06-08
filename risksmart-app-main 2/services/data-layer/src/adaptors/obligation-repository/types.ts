import { obligationIdSchema } from '@risksmart-app/domain/src/types/obligation';
import z from 'zod';

export const externalObligationSchema = z.object({
  Id: obligationIdSchema,
  ExternalId: z.string().min(1),
});

export type ExternalObligation = z.infer<typeof externalObligationSchema>;
