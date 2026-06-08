import { z } from 'zod';

import type { BaseEvent } from './common';
import {
  baseEventMetadataSchema,
  eventTypeSchema,
  requiredUnknown,
  RulebookEvent,
} from './common';

export const orgEventMetadataSchema = baseEventMetadataSchema.extend({
  tenant: z.string(),
  orgKey: z.string(),
  userId: z.literal('SYSTEM'),
});

export const orgEventSchema = z.object({
  type: eventTypeSchema,
  data: requiredUnknown,
  metadata: orgEventMetadataSchema,
});

export type OrgEventMetadata = z.infer<typeof orgEventMetadataSchema>;

export type OrgEvent<TData> = BaseEvent<TData, OrgEventMetadata>;

const externalObligationsUpdatedEventSchema = orgEventSchema.extend({
  type: z.literal(RulebookEvent.ExternalObligationsUpdated),
  data: z.object({
    location: z.string(),
  }),
});

export type ExternalObligationsUpdatedEvent = z.infer<
  typeof externalObligationsUpdatedEventSchema
>;

export const orgEventSchemas = z.discriminatedUnion('type', [
  externalObligationsUpdatedEventSchema,
]);

export type OrgEventTypes = ExternalObligationsUpdatedEvent;
