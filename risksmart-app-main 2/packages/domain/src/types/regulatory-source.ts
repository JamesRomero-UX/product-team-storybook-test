import { z } from 'zod';

export const regulatorySourceIdSchema = z
  .string()
  .uuid()
  .brand<'RegulatorySourceId'>();

export type RegulatorySourceId = z.infer<typeof regulatorySourceIdSchema>;

export const auditableEntitySchema = z.object({
  orgKey: z.string().min(1),
  createdByUser: z.string(),
  modifiedByUser: z.string(),
  createdAtTimestamp: z.string(),
  modifiedAtTimestamp: z.string(),
});

export const newRegulatorySourceSchema = auditableEntitySchema.extend({
  externalRegulatorId: z.string(),
  regulatorName: z.string(),
  providerName: z.string(),
});

export type NewRegulatorySource = Readonly<
  z.infer<typeof newRegulatorySourceSchema>
>;

export const regulatorySourceSchema = newRegulatorySourceSchema.extend({
  id: regulatorySourceIdSchema,
});

export type RegulatorySource = Readonly<z.infer<typeof regulatorySourceSchema>>;
