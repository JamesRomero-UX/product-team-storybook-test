import { UNRATED } from '../types';
import { departmentGetter } from './categoryGetters';

describe('departmentGetter', () => {
  it('should return departments correctly', () => {
    const item = {
      departments: [
        { type: { Name: 'Department 1' }, DepartmentTypeId: '1' },
        { type: { Name: 'Department 2' }, DepartmentTypeId: '2' },
      ],
    };

    const getter = departmentGetter();
    const result = getter(item);

    expect(result).toEqual([
      { key: '1', label: 'Department 1' },
      { key: '2', label: 'Department 2' },
    ]);
  });

  it('should handle no departments correctly', () => {
    const item = {
      departments: [],
    };

    const getter = departmentGetter({ includeNoDepartments: true });
    const result = getter(item);

    expect(result).toEqual({ key: UNRATED, label: 'No department' });
  });

  it('should handle null department type correctly', () => {
    const item = {
      departments: [{ type: null, DepartmentTypeId: '1' }],
    };

    const getter = departmentGetter({ includeNoDepartments: true });
    const result = getter(item);

    expect(result).toEqual([{ key: UNRATED, label: 'No department' }]);
  });
});
