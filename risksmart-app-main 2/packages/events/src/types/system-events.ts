import { z } from 'zod';

import type { BaseEvent } from './common';
import {
  baseEventMetadataSchema,
  eventTypeSchema,
  requiredUnknown,
} from './common';

export const systemEventMetadataSchema = baseEventMetadataSchema.extend({
  userId: z.literal('SYSTEM'),
});

// Generic schema for any system event (validates structure but not specific event type)
export const systemEventSchema = z.object({
  type: eventTypeSchema,
  data: requiredUnknown,
  metadata: systemEventMetadataSchema,
});

export type SystemEventMetadata = z.infer<typeof systemEventMetadataSchema>;

export type SystemEvent<TData> = BaseEvent<TData, SystemEventMetadata>;

// To add a new event, follow the pattern in the other event type files (org, orguser, tenant):
// create a schema for the specific event type and add it to a discriminated union.
