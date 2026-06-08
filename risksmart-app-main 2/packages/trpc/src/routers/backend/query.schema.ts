import { z } from 'zod';

const base = z.object({
  limit: z
    .number()
    .min(1, 'must be 1 or greater')
    .max(1000, 'must be 1000 or less')
    .nullish(),
});

const listQueryBySeqIdBase = base.extend({
  afterSequentialId: z
    .number()
    .min(1, 'Id must be 1 or greater')
    .nullable()
    .optional(),
  beforeSequentialId: z
    .number()
    .min(1, 'Id must be 1 or greater')
    .nullable()
    .optional(),
});

const listQueryByUuidTsBase = base.extend({
  afterId: z.string().uuid().nullish(),
  afterDateTime: z.string().datetime().nullish(),
  beforeId: z.string().uuid().nullish(),
  beforeDateTime: z.string().datetime().nullish(),
});

const noBothBeforeAndAfterUuidTs: z.SuperRefinement<
  z.infer<typeof listQueryByUuidTsBase>
> = (val, ctx) => {
  const afterId = val?.afterId ?? null;
  const afterDateTime = val?.afterDateTime ?? null;
  const beforeId = val?.beforeId ?? null;
  const beforeDateTime = val?.beforeDateTime ?? null;

  // Check if one of afterId or afterDateTime is null but not both
  const afterIdIsNull = afterId === null;
  const afterDateTimeIsNull = afterDateTime === null;
  if (afterIdIsNull !== afterDateTimeIsNull) {
    const msg =
      'Both "afterId" and "afterDateTime" must be provided together or both must be null.';
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['afterId'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['afterDateTime'],
    });
  }

  // Check if one of beforeId or beforeDateTime is null but not both
  const beforeIdIsNull = beforeId === null;
  const beforeDateTimeIsNull = beforeDateTime === null;
  if (beforeIdIsNull !== beforeDateTimeIsNull) {
    const msg =
      'Both "beforeId" and "beforeDateTime" must be provided together or both must be null.';
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['beforeId'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['beforeDateTime'],
    });
  }

  // Check if all 4 values are defined (not null)
  if (
    afterId !== null &&
    afterDateTime !== null &&
    beforeId !== null &&
    beforeDateTime !== null
  ) {
    const msg =
      'Do not provide both "after" and "before" pagination parameters together.';
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['afterId'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['beforeId'],
    });
  }
};

const noBothBeforeAndAfter: z.SuperRefinement<
  z.infer<typeof listQueryBySeqIdBase>
> = (val, ctx) => {
  const isNum = (x: unknown): x is number =>
    typeof x === 'number' && !Number.isNaN(x);
  const afterIsNum = isNum(val?.afterSequentialId);
  const beforeIsNum = isNum(val?.beforeSequentialId);
  if (afterIsNum && beforeIsNum) {
    const msg =
      'Do not provide both "afterSequentialId" and "beforeSequentialId".';
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['afterSequentialId'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['beforeSequentialId'],
    });
  }
};

export const listQueryBySeqIdSchema = listQueryBySeqIdBase
  .superRefine(noBothBeforeAndAfter)
  .optional();

export const linkedListQueryBySeqIdSchema = listQueryBySeqIdBase
  .extend({
    linkId: z.string().uuid(),
  })
  .superRefine(noBothBeforeAndAfter);

export { listQueryByUuidTsBase, noBothBeforeAndAfterUuidTs };

export const listQueryByUuidTsSchema = listQueryByUuidTsBase
  .superRefine(noBothBeforeAndAfterUuidTs)
  .optional();

export const listQueryByUuidTsWithIdFilterSchema = listQueryByUuidTsBase
  .extend({
    filter: z
      .object({
        Id: z
          .array(z.string())
          .max(100, 'Id filter must contain 100 or fewer items'),
      })
      .optional(),
  })
  .superRefine(noBothBeforeAndAfterUuidTs)
  .optional();

export const linkedListQueryByUuidTsSchema = listQueryByUuidTsBase
  .extend({
    linkId: z.string().uuid(),
  })
  .superRefine(noBothBeforeAndAfterUuidTs);

export type ListQueryBySeqId = z.infer<typeof listQueryBySeqIdSchema>;
export type LinkedListQueryBySeqId = z.infer<
  typeof linkedListQueryBySeqIdSchema
>;
export type ListQueryByUuidTs = z.infer<typeof listQueryByUuidTsSchema>;
export type LinkedListQueryByUuidTs = z.infer<
  typeof linkedListQueryByUuidTsSchema
>;
