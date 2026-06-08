import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { describe, expect, it } from 'vitest';

import {
  createIndicatorForParentRequestSchema,
  createIndicatorRequestSchema,
  updateIndicatorRequestSchema,
} from './indicator-mutate-request.schema';

const mockParentId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const validCreateNumberInput = {
  title: 'Test Number Indicator',
  description: 'A description',
  type: IndicatorType.Number,
  unit: 'kg',
  upperTolerance: 100,
  lowerTolerance: 10,
  upperAppetite: 80,
  lowerAppetite: 20,
  parentId: mockParentId,
  owners: ['provider|user-1'],
};

const validCreateTextInput = {
  title: 'Test Text Indicator',
  description: 'A description',
  type: IndicatorType.Text,
  targetValue: 'On track',
  parentId: mockParentId,
  owners: ['provider|user-1'],
};

const validUpdateNumberInput = {
  title: 'Test Number Indicator',
  description: 'A description',
  unit: 'kg',
  upperTolerance: 100,
  lowerTolerance: 10,
  upperAppetite: 80,
  lowerAppetite: 20,
  owners: ['provider|user-1'],
};

const validUpdateTextInput = {
  title: 'Test Text Indicator',
  description: 'A description',
  targetValue: 'On track',
  owners: ['provider|user-1'],
};

describe('createIndicatorRequestSchema', () => {
  describe('number type', () => {
    it('should accept valid number type with all fields', () => {
      const result = createIndicatorRequestSchema.safeParse(
        validCreateNumberInput
      );
      expect(result.success).toBe(true);
    });

    it('should accept number type without tolerance/appetite fields', () => {
      const result = createIndicatorRequestSchema.safeParse({
        title: 'Minimal Number',
        type: IndicatorType.Number,
        parentId: mockParentId,
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept number type with partial tolerance fields', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        upperTolerance: 100,
        lowerTolerance: undefined,
        upperAppetite: undefined,
        lowerAppetite: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('should reject number type with out-of-sequence tolerances', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        lowerTolerance: 50,
        lowerAppetite: 30,
        upperAppetite: 80,
        upperTolerance: 100,
      });
      expect(result.success).toBe(false);
    });

    it('should accept number type with equal tolerance values', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        lowerTolerance: 50,
        lowerAppetite: 50,
        upperAppetite: 50,
        upperTolerance: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should accept number type with ascending tolerance values', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        lowerTolerance: 10,
        lowerAppetite: 20,
        upperAppetite: 80,
        upperTolerance: 100,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('text type', () => {
    it('should accept valid text type with targetValue', () => {
      const result =
        createIndicatorRequestSchema.safeParse(validCreateTextInput);
      expect(result.success).toBe(true);
    });

    it('should reject text type without targetValue', () => {
      const result = createIndicatorRequestSchema.safeParse({
        title: 'Text Indicator',
        type: IndicatorType.Text,
        parentId: mockParentId,
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject text type with empty targetValue', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateTextInput,
        targetValue: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('parentId validation', () => {
    it('should require parentId', () => {
      const { parentId: _removed, ...inputWithoutParent } =
        validCreateNumberInput;
      const result = createIndicatorRequestSchema.safeParse(inputWithoutParent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid parentId format', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        parentId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('common validation', () => {
    it('should reject missing title', () => {
      const result = createIndicatorRequestSchema.safeParse({
        type: IndicatorType.Number,
        parentId: mockParentId,
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing owners', () => {
      const result = createIndicatorRequestSchema.safeParse({
        title: 'Test',
        type: IndicatorType.Number,
        parentId: mockParentId,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty owners array', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        owners: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional description as null', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept optional description as undefined', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        description: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('schedule validation', () => {
    it('should accept valid schedule', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        schedule: {
          frequency: TestFrequency.Monthly,
          manualDueDate: '2025-06-01T00:00:00Z',
          startDate: '2025-01-01T00:00:00Z',
          timeToCompleteValue: 30,
          timeToCompleteUnit: UnitOfTime.Day,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing schedule', () => {
      const result = createIndicatorRequestSchema.safeParse(
        validCreateNumberInput
      );
      expect(result.success).toBe(true);
    });

    it('should accept partial schedule', () => {
      const result = createIndicatorRequestSchema.safeParse({
        ...validCreateNumberInput,
        schedule: {
          frequency: TestFrequency.Weekly,
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('updateIndicatorRequestSchema', () => {
  it('should accept valid number indicator fields', () => {
    const result = updateIndicatorRequestSchema.safeParse(validUpdateNumberInput);
    expect(result.success).toBe(true);
  });

  it('should accept valid text indicator fields', () => {
    const result = updateIndicatorRequestSchema.safeParse(validUpdateTextInput);
    expect(result.success).toBe(true);
  });

  it('should reject out-of-sequence tolerances', () => {
    const result = updateIndicatorRequestSchema.safeParse({
      ...validUpdateNumberInput,
      lowerTolerance: 50,
      lowerAppetite: 30,
      upperAppetite: 80,
      upperTolerance: 100,
    });
    expect(result.success).toBe(false);
  });

  describe('parentId exclusion', () => {
    it('should not require parentId', () => {
      const result = updateIndicatorRequestSchema.safeParse(
        validUpdateNumberInput
      );
      expect(result.success).toBe(true);
    });

    it('should strip parentId from parsed output', () => {
      const result = updateIndicatorRequestSchema.safeParse({
        ...validUpdateNumberInput,
        parentId: mockParentId,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('parentId');
      }
    });
  });

  describe('common validation', () => {
    it('should reject missing title', () => {
      const result = updateIndicatorRequestSchema.safeParse({
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty owners array', () => {
      const result = updateIndicatorRequestSchema.safeParse({
        ...validUpdateNumberInput,
        owners: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('schedule validation', () => {
    it('should accept valid schedule', () => {
      const result = updateIndicatorRequestSchema.safeParse({
        ...validUpdateNumberInput,
        schedule: {
          frequency: TestFrequency.Monthly,
          manualDueDate: '2025-06-01T00:00:00Z',
          startDate: '2025-01-01T00:00:00Z',
          timeToCompleteValue: 30,
          timeToCompleteUnit: UnitOfTime.Day,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing schedule', () => {
      const result = updateIndicatorRequestSchema.safeParse(
        validUpdateNumberInput
      );
      expect(result.success).toBe(true);
    });
  });
});

describe('createIndicatorForParentRequestSchema', () => {
  const validNumberInput = {
    title: 'Test Number Indicator',
    type: IndicatorType.Number,
    owners: ['provider|user-1'],
  };

  const validTextInput = {
    title: 'Test Text Indicator',
    type: IndicatorType.Text,
    targetValue: 'On track',
    owners: ['provider|user-1'],
  };

  describe('number type', () => {
    it('should accept valid Number type without parentId', () => {
      const result =
        createIndicatorForParentRequestSchema.safeParse(validNumberInput);
      expect(result.success).toBe(true);
    });

    it('should strip parentId from parsed output when present in input', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        parentId: mockParentId,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('parentId');
      }
    });

    it('should reject out-of-sequence tolerances', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        lowerTolerance: 50,
        lowerAppetite: 30,
        upperAppetite: 80,
        upperTolerance: 100,
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid ascending tolerance sequence', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        lowerTolerance: 10,
        lowerAppetite: 20,
        upperAppetite: 80,
        upperTolerance: 100,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('text type', () => {
    it('should accept valid Text type', () => {
      const result =
        createIndicatorForParentRequestSchema.safeParse(validTextInput);
      expect(result.success).toBe(true);
    });

    it('should reject text type without targetValue', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        title: 'Text Indicator',
        type: IndicatorType.Text,
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('common validation', () => {
    it('should reject missing title', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        type: IndicatorType.Number,
        owners: ['provider|user-1'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing owners', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        title: 'Test',
        type: IndicatorType.Number,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty owners array', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        owners: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid type value', () => {
      const result = createIndicatorForParentRequestSchema.safeParse({
        ...validNumberInput,
        type: 'Invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
