import { CustomDatasourceService } from './customDatasourceService';

describe('customDatasourceService', () => {
  describe('formatQueryResultsToTable', () => {
    it('formats a cell to contain a value and meta field', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'risks' }],
        fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      });
      const mappedResult = service.formatQueryResultsToTable([
        ['Report Title'],
      ]);
      expect(mappedResult).toEqual([
        [
          {
            value: 'Report Title',
            meta: {},
          },
        ],
      ]);
    });

    it('formats a cell with meta from following columns', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'riskAssessmentResults' }],
        fields: [{ fieldId: 'rating', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      });
      const mappedResult = service.formatQueryResultsToTable([
        ['High', 'red', 2, 3, 4],
      ]);
      expect(mappedResult).toEqual([
        [
          {
            value: 'High',
            meta: { color: 'red', sort: 2, likelihood: 3, impact: 4 },
          },
        ],
      ]);
    });

    it('correctly handles fields following a multi column meta result', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'riskAssessmentResults' }],
        fields: [
          { fieldId: 'rating', dataSourceIndex: 0 },
          { fieldId: 'id', dataSourceIndex: 0 },
        ],
        customAttributeSchemaLookup: {},
      });
      const mappedResult = service.formatQueryResultsToTable([
        ['High', 'red', 2, 3, 4, 6],
      ]);
      expect(mappedResult).toEqual([
        [
          {
            value: 'High',
            meta: { color: 'red', sort: 2, likelihood: 3, impact: 4 },
          },
          { value: 6, meta: {} },
        ],
      ]);
    });

    it('handles grouping on meta fields', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'riskAssessmentResults' }],
        groupBy: [{ field: { fieldId: 'rating', dataSourceIndex: 0 } }],
        customAttributeSchemaLookup: {},
      });
      const mappedResult = service.formatQueryResultsToTable([
        ['High', 'red', 2, 3, 4, 6],
      ]);
      expect(mappedResult).toEqual([
        [
          {
            value: 'High',
            meta: { color: 'red', sort: 2, likelihood: 3, impact: 4 },
          },
          { value: 6, meta: {} },
        ],
      ]);
    });
  });

  describe('assertCustomAttributeFieldExistsOnSchema', () => {
    it('validates successfully when custom attribute exists in schema', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'risks' }],
        fields: [{ fieldId: 'custom/test_text', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {
          risk: {
            properties: {
              test_text: { type: 'string' },
            },
          },
        },
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/test_text',
          dataSourceIndex: 0,
        })
      ).not.toThrow();
    });

    it('throws error when dataset does not have custom attributes', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'risks' }],
        fields: [],
        customAttributeSchemaLookup: {},
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/test_text',
          dataSourceIndex: 0,
        })
      ).toThrow('Custom attribute definition not found for test_text');
    });

    it('throws error when custom attribute not found in schema', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'risks' }],
        fields: [],
        customAttributeSchemaLookup: {
          risk: {
            properties: {
              other_field_text: { type: 'string' },
            },
          },
        },
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/missing_field_text',
          dataSourceIndex: 0,
        })
      ).toThrow('Custom attribute definition not found for missing_field_text');
    });

    it('throws error when schema exists but has no properties', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'risks' }],
        fields: [],
        customAttributeSchemaLookup: {
          risk: {},
        },
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/test_text',
          dataSourceIndex: 0,
        })
      ).toThrow('Custom attribute definition not found for test_text');
    });

    it('validates successfully when attribute found in one of multiple parent types', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'riskAssessmentResults' }],
        fields: [],
        customAttributeSchemaLookup: {
          controlled_risk_assessment_result: {
            properties: {},
          },
          uncontrolled_risk_assessment_result: {
            properties: {
              test_text: { type: 'string' },
            },
          },
        },
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/test_text',
          dataSourceIndex: 0,
        })
      ).not.toThrow();
    });

    it('throws error when empty parent types array', async () => {
      const service = await CustomDatasourceService({
        dataSources: [{ type: 'responses' }],
        fields: [],
        customAttributeSchemaLookup: {},
      });

      expect(() =>
        service.getFieldDefinition({
          fieldId: 'custom/test_text',
          dataSourceIndex: 0,
        })
      ).toThrow(
        'Custom attribute requested on dataset that does not support custom attributes'
      );
    });
  });
});
