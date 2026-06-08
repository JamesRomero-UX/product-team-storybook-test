import type {
  PropertyFilterOperator,
  PropertyFilterOperatorExtended,
  PropertyFilterOption,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import { z } from 'zod';

export const translatedExactFilterOperators = (
  filteringOptions: Omit<PropertyFilterOption, 'propertyKey'>[]
): PropertyFilterOperatorExtended<string>[] =>
  (['=', '!='] as const).map((operator) => ({
    operator,
    format: (value: string) =>
      filteringOptions.find((option) => option.value === value)?.label ?? value,
  }));

export const createIdLabelFieldPropertyFilter = (
  options: { label: string; id: string }[]
): Partial<PropertyFilterProperty> => {
  const getById = (id: string) =>
    options.find((t) => t.id === id)?.label || '-';
  const hasOption = (items: unknown, id: string) =>
    !!((items || []) as { label: string; id: string }[]).find(
      (t) => t.id === id
    );

  const doesNotHaveOption = (items: unknown, id: string) =>
    !hasOption(items, id);

  return {
    operators: [
      ...(['=', ':'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getById,
        match: hasOption,
      })),
      ...(['!=', '!:'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getById,
        match: doesNotHaveOption,
      })),
      {
        operator: '<',
        format: (num: string): string => {
          const parsed = z.coerce.number().default(0).safeParse(num);
          if (parsed.success) {
            return parsed.data.toString();
          }

          return '';
        },
        match: (items: unknown, id: string) => {
          return !!((items || []) as { label: string; id: string }[]).find(
            (t) => t.id === id
          );
        },
      },
    ],
  };
};
