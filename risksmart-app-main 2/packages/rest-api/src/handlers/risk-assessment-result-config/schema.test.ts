import { describe, expect, it } from 'vitest';

import {
  PostRiskAssessmentResultConfigSchema,
  type RiskAssessmentResultConfig,
  RiskAssessmentResultConfigSchema,
} from './schema';

const createValidConfig = (): RiskAssessmentResultConfig => ({
  likelihood: {
    ratings: [
      { title: 'Low', value: 1, color: 'dark-green' },
      { title: 'High', value: 2, color: 'dark-red' },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: 'blue' },
      { name: 'Operational', color: 'purple' },
    ],
    ratings: [
      { title: 'Minor', value: 1, color: 'light-green' },
      { title: 'Major', value: 2, color: 'light-red' },
    ],
    aggregation: 'average' as const,
  },
  matrix: [
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 1 },
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 2 },
    {
      title: 'High',
      value: 2,
      color: 'dark-red',
      likelihood: 2,
      impact: 1,
    },
    {
      title: 'High',
      value: 2,
      color: 'dark-red',
      likelihood: 2,
      impact: 2,
    },
  ],
});

describe('RiskAssessmentResultConfigSchema', () => {
  describe('valid config', () => {
    it('should accept a valid config', () => {
      const config = createValidConfig();
      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should accept optional description in ratings', () => {
      const config = createValidConfig();
      config.likelihood.ratings[0]!.description = 'A low likelihood';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should accept maximum aggregation', () => {
      const config = createValidConfig();
      config.impact.aggregation = 'maximum';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });
  });

  describe('likelihood ratings validation', () => {
    it('should reject empty likelihood ratings', () => {
      const config = createValidConfig();
      config.likelihood.ratings = [];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe(
        'At least one likelihood rating is required'
      );
    });

    it('should reject duplicate likelihood rating values', () => {
      const config = createValidConfig();
      config.likelihood.ratings = [
        { title: 'Low', value: 1, color: 'green' },
        { title: 'Medium', value: 1, color: 'orange' },
      ];
      // Fix matrix to match
      config.matrix = [
        { title: 'Result', value: 1, color: 'green', likelihood: 1, impact: 1 },
        { title: 'Result', value: 1, color: 'green', likelihood: 1, impact: 2 },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Likelihood rating values must be unique',
        })
      );
    });

    it('should reject duplicate likelihood rating titles', () => {
      const config = createValidConfig();
      config.likelihood.ratings = [
        { title: 'Low', value: 1, color: 'green' },
        { title: 'Low', value: 2, color: 'red' },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Likelihood rating titles must be unique',
        })
      );
    });

    it('should reject non-positive likelihood rating values', () => {
      const config = createValidConfig();
      config.likelihood.ratings[0]!.value = 0;

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe(
        'Value must be a positive integer'
      );
    });

    it('should reject empty likelihood rating title', () => {
      const config = createValidConfig();
      config.likelihood.ratings[0]!.title = '';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe('Title is required');
    });
  });

  describe('impact ratings validation', () => {
    it('should reject empty impact ratings', () => {
      const config = createValidConfig();
      config.impact.ratings = [];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe(
        'At least one impact rating is required'
      );
    });

    it('should reject duplicate impact rating values', () => {
      const config = createValidConfig();
      config.impact.ratings = [
        { title: 'Minor', value: 1, color: 'green' },
        { title: 'Major', value: 1, color: 'red' },
      ];
      // Fix matrix
      config.matrix = [
        { title: 'Result', value: 1, color: 'green', likelihood: 1, impact: 1 },
        { title: 'Result', value: 1, color: 'green', likelihood: 2, impact: 1 },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Impact rating values must be unique',
        })
      );
    });

    it('should reject duplicate impact rating titles', () => {
      const config = createValidConfig();
      config.impact.ratings = [
        { title: 'Minor', value: 1, color: 'green' },
        { title: 'Minor', value: 2, color: 'red' },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Impact rating titles must be unique',
        })
      );
    });
  });

  describe('impact categories validation', () => {
    it('should accept zero categories (single-impact mode) without aggregation', () => {
      const config = createValidConfig();
      config.impact.categories = [];
      delete (config.impact as { aggregation?: string }).aggregation;

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should accept zero categories (single-impact mode) with aggregation present', () => {
      const config = createValidConfig();
      config.impact.categories = [];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should reject exactly one category', () => {
      const config = createValidConfig();
      config.impact.categories = [{ name: 'Financial', color: 'blue' }];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message:
            'Must have 0 categories (single impact) or 2+ categories (multi-impact)',
        })
      );
    });

    it('should accept multiple categories with aggregation', () => {
      const config = createValidConfig();

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should reject multiple categories without aggregation', () => {
      const config = createValidConfig();
      delete (config.impact as { aggregation?: string }).aggregation;

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message:
            'aggregation is required when multiple impact categories are defined',
        })
      );
    });

    it('should reject duplicate impact category names', () => {
      const config = createValidConfig();
      config.impact.categories = [
        { name: 'Financial', color: 'blue' },
        { name: 'Financial', color: 'green' },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Impact category names must be unique',
        })
      );
    });

    it('should reject empty category name', () => {
      const config = createValidConfig();
      config.impact.categories[0]!.name = '';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe(
        'Category name is required'
      );
    });
  });

  describe('aggregation validation', () => {
    it('should reject invalid aggregation values', () => {
      const config = createValidConfig();
      (config.impact as { aggregation: string }).aggregation = 'invalid';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
    });
  });

  describe('matrix validation', () => {
    it('should reject empty matrix', () => {
      const config = createValidConfig();
      config.matrix = [];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe(
        'At least one matrix entry is required'
      );
    });

    it('should accept matrix entries with duplicate values', () => {
      const config = createValidConfig();
      config.matrix = [
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 1 },
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 2 },
        {
          title: 'Also Low',
          value: 1,
          color: 'light-green',
          likelihood: 2,
          impact: 1,
        },
        {
          title: 'Also Low',
          value: 1,
          color: 'light-green',
          likelihood: 2,
          impact: 2,
        },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should reject invalid likelihood reference in matrix', () => {
      const config = createValidConfig();
      config.matrix[0]!.likelihood = 99;

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Likelihood value 99 does not exist in likelihood ratings',
        })
      );
    });

    it('should reject invalid impact reference in matrix', () => {
      const config = createValidConfig();
      config.matrix[0]!.impact = 99;

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Impact value 99 does not exist in impact ratings',
        })
      );
    });

    it('should reject duplicate likelihood/impact pairs across matrix', () => {
      const config = createValidConfig();
      config.matrix = [
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 1 },
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 2 },
        { title: 'Low', value: 1, color: 'green', likelihood: 2, impact: 1 },
        { title: 'Low', value: 1, color: 'green', likelihood: 2, impact: 2 },
        { title: 'High', value: 2, color: 'red', likelihood: 1, impact: 1 }, // Duplicate!
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: 'Duplicate likelihood/impact pairs found in matrix',
        })
      );
    });

    it('should reject incomplete matrix (missing pairs)', () => {
      const config = createValidConfig();
      // Only covers 3 of 4 required pairs
      config.matrix = [
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 1 },
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 2 },
        { title: 'Low', value: 1, color: 'green', likelihood: 2, impact: 1 },
        // Missing: { likelihood: 2, impact: 2 }
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error?.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Matrix is incomplete'),
        })
      );
    });

    it('should list all missing pairs in error message', () => {
      const config = createValidConfig();
      config.matrix = [
        { title: 'Low', value: 1, color: 'green', likelihood: 1, impact: 1 },
      ];

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      const error = result.error?.errors.find((e) =>
        e.message.includes('Matrix is incomplete')
      );
      expect(error?.message).toContain('1-2');
      expect(error?.message).toContain('2-1');
      expect(error?.message).toContain('2-2');
    });
  });

  describe('color validation', () => {
    it('should accept any non-empty string as color', () => {
      const config = createValidConfig();
      config.likelihood.ratings[0]!.color = 'custom-color';
      config.impact.ratings[0]!.color = '#FF5733';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(true);
    });

    it('should reject empty color', () => {
      const config = createValidConfig();
      config.likelihood.ratings[0]!.color = '';

      const result = RiskAssessmentResultConfigSchema.safeParse(config);

      expect(result.success).toBe(false);
      expect(result.error!.errors[0]!.message).toBe('Color is required');
    });
  });
});

describe('PostRiskAssessmentResultConfigSchema', () => {
  it('should accept valid input with Config wrapper', () => {
    const input = {
      Config: createValidConfig(),
    };

    const result = PostRiskAssessmentResultConfigSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it('should reject input without Config wrapper', () => {
    const input = createValidConfig();

    const result = PostRiskAssessmentResultConfigSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
