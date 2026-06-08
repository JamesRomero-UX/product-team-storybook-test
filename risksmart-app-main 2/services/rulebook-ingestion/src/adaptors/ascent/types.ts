import z from 'zod';

export const ascentManyResponseSchema = z.object({
  data: z.array(z.unknown()),
  links: z.unknown(),
});

export const ascentSingleResponseSchema = z.object({
  data: z.unknown(),
  links: z.unknown(),
});

export const ascentRegulatorSchema = z.object({
  id: z.string(),
  type: z.literal('regulator'),
  attributes: z.object({
    name: z.string(),
    regionLocation: z.string(),
    countryLocation: z.string(),
    stateTerritoryLocation: z.string(),
    links: z.object({
      app: z.string().url(),
    }),
  }),
});

export type AscentRegulator = z.infer<typeof ascentRegulatorSchema>;

export const ascentRuleSchema = z.object({
  id: z.string(),
  type: z.literal('rule'),
  attributes: z.object({
    number: z.string(),
    title: z.string().optional().nullable(), // Title is occasionally missing from Ascent data
    content: z.string(),
    position: z.number(),
    startsAt: z.string(), // ISO date string
    endsAt: z.string().nullable(),
    publishedDate: z.string(), // ISO date string
    createdAt: z.string(), // ISO datetime string
    modifiedAt: z.string(), // ISO datetime string
    hierarchy: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['section', 'regulator']),
        name: z.string(),
        position: z.number().optional(),
      })
    ),
    links: z.object({
      app: z.string(),
    }),
  }),
});

export type AscentRule = z.infer<typeof ascentRuleSchema>;

export const ascentTaskSchema = z.object({
  id: z.string(),
  type: z.literal('task'),
  attributes: z.object({
    createdAt: z.string(), // ISO datetime string
    modifiedAt: z.string(), // ISO datetime string
    frequency: z
      .enum([
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'bi-annually',
        'annually',
      ])
      .nullable(),
    preview: z.string(), // Short title extracted or generated for each obligation
    disableReason: z.string().nullable(), // Short explanation of why task was disabled
    requirementId: z.string(), // Requirement ID associated with the obligation
    statusChangedAt: z.string(), // ISO datetime string
    links: z.object({
      self: z.string().url(), // Link back to AscentFocus for this obligation
    }),
    hierarchy: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['rule', 'section', 'regulator']),
        name: z.string(),
        number: z.string().optional(), // Only present for 'rule' type
      })
    ),
    citation: z.string(), // The citation or number of the subpart of the rule
    tags: z.array(z.string()), // List of tags
    publishedDate: z.string(), // ISO date string
    startsAt: z.string(), // ISO date string - when obligation goes into effect
    endsAt: z.string().nullable(), // ISO date string - when obligation ends
    status: z.enum(['enabled', 'disabled', 'expired']),
    content: z.string(), // The text of this obligation
    dueDate: z.string().nullable(), // ISO date string
  }),
});

export type AscentTask = z.infer<typeof ascentTaskSchema>;

export const ascentHierarchicalEntitySchema = z.object({
  id: z.string(),
  attributes: z.object({
    hierarchy: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['rule', 'section', 'regulator']),
        name: z.string(),
        number: z.string().optional(), // Only present for 'rule' type
      })
    ),
  }),
});

export type AscentHierarchicalEntity = z.infer<
  typeof ascentHierarchicalEntitySchema
>;

export const ascentTaskVersionSchema = z.object({
  id: z.string(),
  type: z.literal('task version'),
  attributes: z.object({
    taskId: z.number(),
    startsAt: z.string(),
    endsAt: z.string().nullable(),
    content: z.string(),
    createdAt: z.string(),
    modifiedAt: z.string(),
    changeSummary: z.string().nullable(),
    links: z.object({
      app: z.string().url(),
      changeDetail: z.string().url(),
    }),
    diff: z.object({
      previous: z.string(),
      this: z.string(),
    }),
    changeSource: z
      .object({
        title: z.string(),
        originalUrl: z.string().url(),
        documentDate: z.string(),
      })
      .partial(),
  }),
});

export type AscentTaskVersion = z.infer<typeof ascentTaskVersionSchema>;
