import { z } from 'zod';

// Color schema accepts any string for now to support mapping from taxonomy ratings
// TODO: Once all customers are migrated to the new config, introduce stricter validation with preset colors and hex codes
export const ColorSchema = z.string().min(1, 'Color is required');

// Aggregation method for impact calculation
export const AggregationEnum = z.enum(['average', 'maximum']);

// Rating item schema (used for both likelihood and impact ratings)
const RatingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  value: z.number().int().positive('Value must be a positive integer'),
  color: ColorSchema,
});

const LikelihoodSchema = z.object({
  ratings: z
    .array(RatingSchema)
    .min(1, 'At least one likelihood rating is required'),
});

const ImpactCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: ColorSchema,
});

const ImpactSchema = z
  .object({
    categories: z.array(ImpactCategorySchema),
    ratings: z
      .array(RatingSchema)
      .min(1, 'At least one impact rating is required'),
    aggregation: AggregationEnum.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categories.length === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Must have 0 categories (single impact) or 2+ categories (multi-impact)',
        path: ['categories'],
      });
    }
    if (data.categories.length > 1 && !data.aggregation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'aggregation is required when multiple impact categories are defined',
        path: ['aggregation'],
      });
    }
  });

const MatrixCellSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().int().positive('Value must be a positive integer'),
  color: ColorSchema,
  likelihood: z
    .number()
    .int()
    .positive('Likelihood must be a positive integer'),
  impact: z.number().int().positive('Impact must be a positive integer'),
});

const hasUniqueValues = <T>(
  arr: T[],
  accessor: (item: T) => unknown
): boolean => {
  const values = arr.map(accessor);

  return new Set(values).size === values.length;
};

export const RiskAssessmentResultConfigSchema = z
  .object({
    likelihood: LikelihoodSchema,
    impact: ImpactSchema,
    matrix: z
      .array(MatrixCellSchema)
      .min(1, 'At least one matrix entry is required'),
  })
  .superRefine((config, ctx) => {
    // Validate unique values in likelihood ratings
    if (!hasUniqueValues(config.likelihood.ratings, (r) => r.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Likelihood rating values must be unique',
        path: ['likelihood', 'ratings'],
      });
    }

    // Validate unique titles in likelihood ratings
    if (!hasUniqueValues(config.likelihood.ratings, (r) => r.title)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Likelihood rating titles must be unique',
        path: ['likelihood', 'ratings'],
      });
    }

    // Validate unique values in impact ratings
    if (!hasUniqueValues(config.impact.ratings, (r) => r.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Impact rating values must be unique',
        path: ['impact', 'ratings'],
      });
    }

    // Validate unique titles in impact ratings
    if (!hasUniqueValues(config.impact.ratings, (r) => r.title)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Impact rating titles must be unique',
        path: ['impact', 'ratings'],
      });
    }

    // Validate unique impact category names
    if (!hasUniqueValues(config.impact.categories, (c) => c.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Impact category names must be unique',
        path: ['impact', 'categories'],
      });
    }

    // The following validates the matrix entries for completeness and correctness

    // Get valid likelihood and impact values
    const validLikelihoodValues = new Set(
      config.likelihood.ratings.map((r) => r.value)
    );

    const validImpactValues = new Set(
      config.impact.ratings.map((r) => r.value)
    );

    // Collect all likelihood/impact pairs from matrix and validate references
    const allPairs: string[] = [];

    config.matrix.forEach((entry) => {
      // Validate likelihood value exists
      if (!validLikelihoodValues.has(entry.likelihood)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Likelihood value ${entry.likelihood} does not exist in likelihood ratings`,
          path: ['matrix'],
        });
      }

      // Validate impact value exists
      if (!validImpactValues.has(entry.impact)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Impact value ${entry.impact} does not exist in impact ratings`,
          path: ['matrix'],
        });
      }

      // Track pair for duplicate/completeness checking
      allPairs.push(`${entry.likelihood}-${entry.impact}`);
    });

    // Check for duplicate pairs across matrix
    const pairSet = new Set(allPairs);
    if (pairSet.size !== allPairs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate likelihood/impact pairs found in matrix',
        path: ['matrix'],
      });
    }

    // Check that all permutations are covered
    const expectedPairs = new Set<string>();
    validLikelihoodValues.forEach((likelihood) => {
      validImpactValues.forEach((impact) => {
        expectedPairs.add(`${likelihood}-${impact}`);
      });
    });

    // Find missing pairs
    const missingPairs: string[] = [];
    expectedPairs.forEach((pair) => {
      if (!pairSet.has(pair)) {
        missingPairs.push(pair);
      }
    });

    if (missingPairs.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Matrix is incomplete. Missing likelihood/impact pairs: ${missingPairs.join(', ')}`,
        path: ['matrix'],
      });
    }
  });

export type RiskAssessmentResultConfig = z.infer<
  typeof RiskAssessmentResultConfigSchema
>;

export const PostRiskAssessmentResultConfigSchema = z.object({
  Config: RiskAssessmentResultConfigSchema,
});

export type PostRiskAssessmentResultConfigInput = z.infer<
  typeof PostRiskAssessmentResultConfigSchema
>;

export const PutRiskAssessmentResultConfigSchema = z.object({
  Id: z.string().uuid(),
  Config: RiskAssessmentResultConfigSchema,
  OriginalTimestamp: z.string().datetime({ offset: true }),
});

export type PutRiskAssessmentResultConfigInput = z.infer<
  typeof PutRiskAssessmentResultConfigSchema
>;
