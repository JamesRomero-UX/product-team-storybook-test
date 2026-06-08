import { z } from 'zod';

import { auditFieldSchema } from './common.types';
import { regulatorySourceIdSchema } from './regulatory-source';

export const obligationIdSchema = z.string().uuid().brand<'ObligationId'>();
export type ObligationId = z.infer<typeof obligationIdSchema>;

export const baseObligationSchema = auditFieldSchema.extend({
  id: obligationIdSchema,
  parentId: obligationIdSchema.nullable(),
  title: z.string().min(1),
  description: z.string(),
  adherence: z.string().min(1),
  type: z.enum(['standard', 'chapter', 'rule', 'task']),
  orgKey: z.string().min(1),
  interpretation: z.string().optional().nullable(),
  customAttributeData: z.record(z.unknown()).optional().nullable(),
  sequentialId: z.number().int().optional().nullable(),
  reference: z.string().optional().nullable(),

  externalId: z.string().max(255).optional().nullable(),
  regulatorySourceId: regulatorySourceIdSchema.optional().nullable(),
  externalSyncedAt: z.date().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
});

export const obligationStandardSchema = baseObligationSchema.extend({
  type: z.literal('standard'),
});

export type ObligationStandard = Readonly<
  z.infer<typeof obligationStandardSchema>
>;

export const obligationChapterSchema = baseObligationSchema.extend({
  type: z.literal('chapter'),
  parentId: obligationIdSchema,
});

export type ObligationChapter = Readonly<
  z.infer<typeof obligationChapterSchema>
>;

export const obligationRuleSchema = baseObligationSchema.extend({
  type: z.literal('rule'),
  parentId: obligationIdSchema,
});

export type ObligationRule = Readonly<z.infer<typeof obligationRuleSchema>>;

export type Obligation =
  | ObligationStandard
  | ObligationChapter
  | ObligationRule;

export const newObligationSchema = baseObligationSchema
  .partial({
    id: true,
    sequentialId: true,
    createdAtTimestamp: true,
    modifiedAtTimestamp: true,
  })
  .extend({
    externalParentId: z.string().max(255).nullable(),
    contentHash: z.string().max(64).optional().nullable(),
  });

export type NewObligation = z.infer<typeof newObligationSchema>;

export const newObligationStandardSchema = newObligationSchema.extend({
  type: z.literal('standard'),
  parentId: z.null(),
});

export const newObligationChapterSchema = newObligationSchema
  .extend({
    type: z.literal('chapter'),
    parentId: obligationIdSchema,
  })
  .extend({
    externalParentId: z.string().max(255).nullable(),
  });

export const newObligationRuleSchema = newObligationSchema
  .extend({
    type: z.literal('rule'),
    parentId: obligationIdSchema,
  })
  .extend({
    externalParentId: z.string().max(255).nullable(),
  });

export const newObligationTaskSchema = newObligationSchema
  .extend({
    type: z.literal('task'),
    parentId: obligationIdSchema,
  })
  .extend({
    externalParentId: z.string().max(255).nullable(),
  });

export const asChapter = (
  newObligation: NewObligation,
  parentId: ObligationId
) => {
  return newObligationChapterSchema.parse({
    ...newObligation,
    parentId,
  } satisfies NewObligation);
};

export const asRule = (
  newObligation: NewObligation,
  parentId: ObligationId
) => {
  return newObligationRuleSchema.parse({
    ...newObligation,
    parentId,
  } satisfies NewObligation);
};

export const asTask = (
  newObligation: NewObligation,
  parentId: ObligationId
) => {
  return newObligationTaskSchema.parse({
    ...newObligation,
    parentId,
  } satisfies NewObligation);
};

export type NewObligationStandard = Readonly<
  z.infer<typeof newObligationStandardSchema>
>;
export type NewObligationChapter = Readonly<
  z.infer<typeof newObligationChapterSchema>
>;
export type NewObligationRule = Readonly<
  z.infer<typeof newObligationRuleSchema>
>;
export type NewObligationTask = Readonly<
  z.infer<typeof newObligationTaskSchema>
>;
