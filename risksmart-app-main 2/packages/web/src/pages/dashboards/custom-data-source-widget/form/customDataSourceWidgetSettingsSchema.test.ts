import type { AggregateType } from '@risksmart-app/shared/reporting/schema';

import type { CustomDataSourceWidgetSettings } from './customDataSourceWidgetSettingsSchema';
import { customDataSourceWidgetSettingsSchema } from './customDataSourceWidgetSettingsSchema';

describe('customDataSourceWidgetSettingsSchema', () => {
  it('table chartType only requires a data source', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
      chartType: 'table',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(true);
  });

  it('data source is always required', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: null as unknown as string,
      chartType: null as unknown as 'table',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors[0]).toEqual({
      code: 'invalid_type',
      expected: 'string',
      message: 'Required',
      path: ['customDataSourceId'],
      received: 'null',
    });
  });

  it('is valid when all required fields specified', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
      chartType: 'bar',
      x1FieldId: 'field1',
      aggregationType: 'count',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(true);
  });

  it('kpi charts only require a data source and an aggregation type (if count)', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
      chartType: 'kpi',
      aggregationType: 'count',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(true);
  });

  it('kpi charts require aggregationType', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
      chartType: 'kpi',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors[0]).toEqual({
      code: 'custom',
      message: 'Required',
      path: ['aggregationType'],
    });
  });

  it.each<{ aggregationType: AggregateType }>([
    {
      aggregationType: 'max',
    },
    {
      aggregationType: 'min',
    },
    {
      aggregationType: 'avg',
    },
    {
      aggregationType: 'sum',
    },
    {
      aggregationType: 'distinctCount',
    },
  ])(
    'if aggregation type is set to $aggregationType, then yFieldId is required',
    ({ aggregationType }) => {
      const settings: CustomDataSourceWidgetSettings = {
        customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
        chartType: 'kpi',
        aggregationType,
      };
      const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
      expect(result.success).toEqual(false);
      expect(!result.success && result.error.errors[0]).toEqual({
        code: 'custom',
        message: 'Required',
        path: ['yFieldId'],
      });
    }
  );

  it.each([
    {
      chartType: 'bar',
    },
    {
      chartType: 'min',
    },
    {
      chartType: 'avg',
    },
    {
      chartType: 'sum',
    },
  ])(
    'if aggregation type is set to $aggregationType, then yFieldId is required',
    () => {
      const settings: CustomDataSourceWidgetSettings = {
        customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
        aggregationType: 'min',
        chartType: 'kpi',
      };
      const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
      expect(result.success).toEqual(false);
      expect(!result.success && result.error.errors[0]).toEqual({
        code: 'custom',
        message: 'Required',
        path: ['yFieldId'],
      });
    }
  );

  it('x1FieldId and x2FieldId cannot reference the same field', () => {
    const settings: CustomDataSourceWidgetSettings = {
      customDataSourceId: '2ab83368-45f2-461f-b2e1-13ac560a62f5',
      aggregationType: 'count',
      chartType: 'bar',
      x1FieldId: 'field1',
      x2FieldId: 'field1',
    };
    const result = customDataSourceWidgetSettingsSchema.safeParse(settings);
    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors[0]).toEqual({
      code: 'custom',
      message: 'Field must be different to category',
      path: ['x2FieldId'],
    });
  });
});
