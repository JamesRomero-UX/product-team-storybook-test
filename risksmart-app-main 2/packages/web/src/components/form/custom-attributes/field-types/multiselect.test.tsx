import type { JsonSchema7 } from '@jsonforms/core';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { MultiOptionsFieldDefinition } from '@risksmart-app/shared/reporting/display-types/multiOptions';
import { render, screen } from '@testing-library/react';
import { randomUUID } from 'crypto';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { FieldRendererProps } from '../renderers/collection-layouts/types';
import type { CustomAttributeProps } from '../renderers/field-layouts/CustomAttributeProps';
import { multiselect } from './multiselect';

// Mock dependencies
vi.mock('@/components/badge-list', () => ({
  default: ({ badges }: { badges: string[] }) => (
    <div data-testid={'badge-list'}>
      {badges.map((badge, index) => (
        <span key={index} data-testid={`badge-${index}`}>
          {badge}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('@/utils/table/utils/customAttributeHelpers', () => ({
  matchToArrayField: vi.fn((data, path) => {
    return data?.[path] || [];
  }),

  resolveDisplayValues: vi.fn(),
}));

vi.mock('./defaults', () => ({
  getBasicFieldConfig: vi.fn((renderProps) => ({
    header: renderProps.label,
    custom: true,
    customFieldValue: vi.fn(),
    exportVal: vi.fn(),
  })),
}));

vi.mock('../renderers/field-layouts/CustomAttributeMultiSelect', () => ({
  CustomAttributeMultiSelect: ({
    value,
    onChange,
    label,
  }: CustomAttributeProps<string[]>) => (
    <div data-testid={'custom-attribute-multiselect'}>
      <label>{label}</label>
      <div data-testid={'multiselect-value'}>{JSON.stringify(value)}</div>
      <button onClick={() => onChange(['test'])} data-testid={'change-value'}>
        {'Change Value'}
      </button>
    </div>
  ),
}));

describe('multiselect FieldTypeConfig', () => {
  const mockRenderProps: FieldRendererProps = {
    type: CustomAttributeFieldType.MultiSelect,
    label: 'Test Multiselect',
    scope: 'test-scope',
    path: 'testField',
    options: [
      {
        _tag: 'StringOption',
        Value: 'Option 1',
        GeneratedId: randomUUID(),
      },
      {
        _tag: 'StringOption',
        Value: 'Option 2',
        GeneratedId: randomUUID(),
      },
      {
        _tag: 'StringOption',
        Value: 'Option 3',
        GeneratedId: randomUUID(),
      },
    ],
  };

  describe('basic configuration', () => {
    it('should have correct i18nKey', () => {
      expect(multiselect.i18nKey).toBe(
        'customAttributes.fieldTypes.multiselect'
      );
    });

    it('should have hasOptions set to true', () => {
      expect(multiselect.hasOptions).toBe(true);
    });

    it('should have FieldComponent defined', () => {
      expect(multiselect.FieldComponent).toBeDefined();
    });
  });

  describe('getTableFieldConfig', () => {
    it('should return a table field configuration', () => {
      const config = multiselect.getTableFieldConfig(mockRenderProps, {
        enableRelativeDates: false,
      });

      expect(config).toBeDefined();
      expect(config.filterOptions).toBeDefined();
      expect(config.cell).toBeDefined();
    });

    it('should configure filtering properties with correct operators', () => {
      const config = multiselect.getTableFieldConfig(mockRenderProps, {
        enableRelativeDates: false,
      });

      const { filteringProperties } = config.filterOptions!;
      expect(filteringProperties?.operators).toHaveLength(2);

      // Cast to the correct type based on the actual implementation
      const operators = filteringProperties!.operators! as Array<{
        operator: string;
        match: (rowValues: unknown, filterValue: string) => boolean;
      }>;
      expect(operators[0].operator).toBe('=');
      expect(operators[1].operator).toBe(':');
    });

    it('should create filtering options from renderProps options', () => {
      const config = multiselect.getTableFieldConfig(mockRenderProps, {
        enableRelativeDates: false,
      });

      const { filteringOptions } = config.filterOptions!;
      expect(filteringOptions).toEqual([
        { value: 'Option 1', label: 'Option 1' },
        { value: 'Option 2', label: 'Option 2' },
        { value: 'Option 3', label: 'Option 3' },
      ]);
    });

    it('should handle empty options', () => {
      const propsWithoutOptions = { ...mockRenderProps, options: undefined };
      const config = multiselect.getTableFieldConfig(propsWithoutOptions, {
        enableRelativeDates: false,
      });

      const { filteringOptions } = config.filterOptions!;
      expect(filteringOptions).toEqual([]);
    });

    it('should render cell with BadgeList component', () => {
      const config = multiselect.getTableFieldConfig(mockRenderProps, {
        enableRelativeDates: false,
      });

      const mockData = {
        CustomAttributeData: {
          testField: ['Option 1', 'Option 2'],
        },
      };

      render(<div>{config.cell!(mockData)}</div>);
      expect(screen.getByTestId('badge-list')).toBeInTheDocument();
    });
  });

  describe('filter operators', () => {
    let config: ReturnType<typeof multiselect.getTableFieldConfig>;

    beforeEach(() => {
      config = multiselect.getTableFieldConfig(mockRenderProps, {
        enableRelativeDates: false,
      });
    });

    describe('= operator', () => {
      it('should match when array contains the filter value', () => {
        const operators = config.filterOptions!.filteringProperties!
          .operators! as Array<{
          operator: string;
          match: (rowValues: unknown, filterValue: string) => boolean;
        }>;
        const equalOperator = operators.find((op) => op.operator === '=')!;

        expect(equalOperator.match(['Option 1', 'Option 2'], 'Option 1')).toBe(
          true
        );
        expect(equalOperator.match(['Option 1', 'Option 2'], 'Option 3')).toBe(
          false
        );
      });

      it('should return false for non-array values', () => {
        const operators = config.filterOptions!.filteringProperties!
          .operators! as Array<{
          operator: string;
          match: (rowValues: unknown, filterValue: string) => boolean;
        }>;
        const equalOperator = operators.find((op) => op.operator === '=')!;

        expect(equalOperator.match('Option 1', 'Option 1')).toBe(false);
        expect(equalOperator.match(null, 'Option 1')).toBe(false);
        expect(equalOperator.match(undefined, 'Option 1')).toBe(false);
      });
    });

    describe(': operator', () => {
      it('should match when array contains the filter value', () => {
        const operators = config.filterOptions!.filteringProperties!
          .operators! as Array<{
          operator: string;
          match: (rowValues: unknown, filterValue: string) => boolean;
        }>;
        const containsOperator = operators.find((op) => op.operator === ':')!;

        expect(
          containsOperator.match(['Option 1', 'Option 2'], 'Option 1')
        ).toBe(true);
        expect(
          containsOperator.match(['Option 1', 'Option 2'], 'Option 3')
        ).toBe(false);
      });

      it('should return false for non-array values', () => {
        const operators = config.filterOptions!.filteringProperties!
          .operators! as Array<{
          operator: string;
          match: (rowValues: unknown, filterValue: string) => boolean;
        }>;
        const containsOperator = operators.find((op) => op.operator === ':')!;

        expect(containsOperator.match('Option 1', 'Option 1')).toBe(false);
        expect(containsOperator.match(null, 'Option 1')).toBe(false);
        expect(containsOperator.match(undefined, 'Option 1')).toBe(false);
      });
    });
  });

  describe('getCustomDataSourceFieldDefinition', () => {
    it('should return correct field definition', () => {
      const definition =
        multiselect.getCustomDataSourceFieldDefinition!(mockRenderProps);

      expect(definition).toEqual({
        defaultLabel: 'Test Multiselect',
        displayType: 'multiOptions',
        dataType: 'textArray',
        getOptions: expect.any(Function),
      });
    });

    it('should return options as value-label pairs', () => {
      const definition =
        multiselect.getCustomDataSourceFieldDefinition!(mockRenderProps);
      // Type assertion since we know this returns a MultiOptionsFieldDefinition
      const multiOptionsDefinition = definition as MultiOptionsFieldDefinition;
      const options = multiOptionsDefinition.getOptions();

      expect(options).toEqual([
        { value: 'Option 1', label: 'Option 1' },
        { value: 'Option 2', label: 'Option 2' },
        { value: 'Option 3', label: 'Option 3' },
      ]);
    });

    it('should handle undefined options', () => {
      const propsWithoutOptions = { ...mockRenderProps, options: undefined };
      const definition =
        multiselect.getCustomDataSourceFieldDefinition!(propsWithoutOptions);
      // Type assertion since we know this returns a MultiOptionsFieldDefinition
      const multiOptionsDefinition = definition as MultiOptionsFieldDefinition;
      const options = multiOptionsDefinition.getOptions();

      expect(options).toEqual([]);
    });
  });

  describe('FieldComponent rendering', () => {
    it('should render the CustomAttributeMultiSelect component', () => {
      const { FieldComponent } = multiselect;

      const mockSchema: JsonSchema7 = {
        type: 'array',
        items: { type: 'string' },
      };

      const mockProps = {
        value: ['Option 1'],
        onChange: vi.fn(),
        label: 'Test Multiselect',
        schema: mockSchema,
      };

      // Cast through unknown since the actual component expects string[] but the type definition is string
      const Component = FieldComponent as unknown as React.ComponentType<
        typeof mockProps
      >;
      render(<Component {...mockProps} />);
      expect(
        screen.getByTestId('custom-attribute-multiselect')
      ).toBeInTheDocument();
    });
  });
});
