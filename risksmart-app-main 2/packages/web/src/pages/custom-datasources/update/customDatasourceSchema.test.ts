import type { CustomDatasourceFormData } from './customDatasourceSchema';
import { customDatasourceFormSchema } from './customDatasourceSchema';

describe('customDatasourceSchema', () => {
  it('at least 1 field must be selected', () => {
    const value: CustomDatasourceFormData = {
      dataSource: { type: 'risks', fields: [], children: [] },
      title: 'Title',
      filters: { tokens: [], tokenGroups: [], operation: 'and' },
    };
    const result = customDatasourceFormSchema.safeParse(value);
    expect(result.error?.issues).toEqual([
      {
        code: 'custom',
        message: 'At least 1 field must be selected',
        path: ['dataSource'],
      },
    ]);
  });
});
