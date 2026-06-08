import type { DataType } from './datasets/types';
import type { AggregateType } from './schema';

/**
 * Map of which data types support which types of aggregation
 */
export const aggregateTypeSupportedDataTypes: {
  [aggregationType in AggregateType]: DataType[];
} = {
  min: ['number', 'text', 'date'],
  max: ['number', 'text', 'date'],
  count: ['number', 'bool', 'text', 'date', 'guid'],
  distinctCount: ['number', 'bool', 'text', 'date', 'guid'],
  avg: ['number'],
  sum: ['number'],
};

/**
 * The following aggregation types always return a number
 */
export const aggregateTypesNotSupportingLabels: AggregateType[] = [
  'distinctCount',
  'count',
  'avg',
  'sum',
];
