import { UNRATED } from '../types';
import { departmentFilter } from './propertyFilterTokens';

describe('departmentFilter', () => {
  it('should return correct filter when key is not UNRATED', () => {
    const item = {
      key: '1',
      label: 'Department 1',
      aggregatedValue: 1,
      data: [],
    };

    const result = departmentFilter(item);

    expect(result).toEqual([
      {
        propertyKey: 'departments',
        value: '1',
        operator: ':',
      },
    ]);
  });

  it('should return correct filter when key is UNRATED', () => {
    const item = {
      key: UNRATED,
      label: 'No department',
      aggregatedValue: 1,
      data: [],
    };

    const result = departmentFilter(item);

    expect(result).toEqual([
      {
        propertyKey: 'departments',
        value: 1,
        operator: '<',
      },
    ]);
  });
});
