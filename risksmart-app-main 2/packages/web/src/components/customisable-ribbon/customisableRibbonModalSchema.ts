import _ from 'lodash';
import { z } from 'zod';

export const tokenSchema = z.object({
  propertyKey: z.string().or(z.undefined()),
  operator: z.string(),
  value: z.string().or(
    z
      .object({
        key: z.string().or(z.undefined()),
        type: z.enum(['relative', 'absolute']),
        unit: z.enum(['day', 'week', 'month', 'year']),
        amount: z.number().int().or(z.undefined()),
      })
      .or(
        z.object({
          type: z.enum(['relative', 'absolute']),
          startDate: z.string().or(z.null()),
          endDate: z.string().or(z.null()),
        })
      )
      .or(z.null())
  ),
});
export type Token = z.infer<typeof tokenSchema>;
const OperationSchema = z.enum(['and', 'or']);

const tokenGroupSchema = z.object({
  operation: OperationSchema,
  tokens: tokenSchema.array().readonly(),
});
export type TokenGroup = z.infer<typeof tokenGroupSchema>;

const itemFilterQuerySchema = z.object({
  operation: OperationSchema,
  tokens: tokenSchema.array().readonly(),
  tokenGroups: tokenSchema.or(tokenGroupSchema).array().optional().readonly(),
});

const FilterModalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: 'Required' }),
  itemFilterQuery: itemFilterQuerySchema,
});

export const CustomisableRibbonModalSchema = FilterModalSchema.array();

export type FilterModal = z.infer<typeof FilterModalSchema>;
export type ItemFilterQuery = z.infer<typeof itemFilterQuerySchema>;

export const CustomisableRibbonFormSchema = z
  .object({
    Filters: CustomisableRibbonModalSchema,
  })
  .superRefine(({ Filters }, ctx) => {
    if (Filters.length === 0) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['global'],
        message: 'At least one filter is required',
      });
    }
    Filters.forEach((filter) => {
      const tokenGroups = filter.itemFilterQuery.tokenGroups ?? [];
      if (tokenGroups.length > 0) {
        tokenGroups.forEach((token) => {
          if ('value' in token) {
            if (token.value === null) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['global'],
                message: 'One or more filters have an invalid value',
              });
            }
          } else {
            token.tokens.forEach((token) => {
              if (token.value === null) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ['global'],
                  message: 'One or more filters have an invalid value',
                });
              }
            });
          }
        });
      }
    });

    if (Filters.length > 1) {
      Filters.forEach((filter, index) => {
        if (
          Filters.slice(index + 1).some((f) => {
            return areFilterModelsEqual(filter, f);
          })
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['global'],
            message:
              'Two or more filters have the same title or filtering options',
          });
        }
      });
    }
  });

export type CustomisableRibbonModalFields = z.infer<
  typeof CustomisableRibbonFormSchema
>;

export const areFilterModelsEqual = (
  filter1: FilterModal,
  filter2: FilterModal
) => {
  return (
    filter1.title === filter2.title ||
    areItemFilterQueriesEqual(filter1.itemFilterQuery, filter2.itemFilterQuery)
  );
};

export const areItemFilterQueriesEqual = (
  itemFilterQuery1: ItemFilterQuery,
  itemFilterQuery2: ItemFilterQuery
): boolean => {
  if (itemFilterQuery1.operation !== itemFilterQuery2.operation) {
    return false;
  }
  if (
    itemFilterQuery1.tokenGroups?.length !==
    itemFilterQuery2.tokenGroups?.length
  ) {
    return false;
  }

  const groups1: TokenGroup[] =
    itemFilterQuery1.tokenGroups?.filter((tg) => 'operation' in tg) ?? [];
  const groups2: TokenGroup[] =
    itemFilterQuery2.tokenGroups?.filter((tg) => 'operation' in tg) ?? [];

  if (groups1.length !== groups2.length) {
    return false;
  }

  if (!groups1.every((t) => groups2.find((ct) => areTokenGroupsEqual(ct, t)))) {
    return false;
  }

  const groupsWithoutOperation1: Token[] =
    itemFilterQuery1.tokenGroups?.filter((token) => 'operator' in token) ?? [];
  const groupsWithoutOperation2: Token[] =
    itemFilterQuery2.tokenGroups?.filter((token) => 'operator' in token) ?? [];

  if (groupsWithoutOperation1.length !== groupsWithoutOperation2.length) {
    return false;
  }

  if (
    !groupsWithoutOperation1.every((t) =>
      groupsWithoutOperation2.find((ct) => areTokensEqual(ct, t))
    )
  ) {
    return false;
  }

  const tokens1: Token[] =
    itemFilterQuery1.tokens?.filter((token) => 'operator' in token) ?? [];
  const tokens2: Token[] =
    itemFilterQuery2.tokens?.filter((token) => 'operator' in token) ?? [];

  if (tokens1.length !== tokens2.length) {
    return false;
  }

  if (!tokens1.every((t) => tokens2.find((ct) => areTokensEqual(ct, t)))) {
    return false;
  }

  return true;
};

export const areTokenGroupsEqual = (
  tokenGroup1: TokenGroup,
  tokenGroup2: TokenGroup
): boolean => {
  if (
    tokenGroup1.operation !== tokenGroup2.operation ||
    tokenGroup1.tokens.length !== tokenGroup2.tokens.length
  ) {
    return false;
  }

  if (
    !tokenGroup1.tokens.every((t) =>
      tokenGroup2.tokens.find((ct) => areTokensEqual(ct, t))
    )
  ) {
    return false;
  }

  return true;
};
export const areTokensEqual = (token1: Token, token2: Token): boolean => {
  return (
    token1.operator == token2.operator &&
    token1.propertyKey === token2.propertyKey &&
    token1.value === token2.value
  );
};
