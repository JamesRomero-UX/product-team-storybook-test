import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { TreeCustomDatasourceModel } from './customDatasourceModel';

describe('customDatasourceModel', () => {
  describe('getAvailableFields', () => {
    it('returns custom attribute fields for a data source', () => {
      const model = TreeCustomDatasourceModel(
        { type: 'risks', children: [], fields: [] },
        {
          [Parent_Type_Enum.Risk]: {
            UiSchema: {
              type: 'VerticalLayout',
              elements: [
                {
                  type: 'Control',
                  label: 'Custom 1',
                  scope: `#/properties/1739887545268_text`,
                },
              ],
            },
            Schema: {
              properties: {
                '1739887545268_text': {
                  type: 'string',
                  description: 'uischema defined text input',
                },
              },
            },
            Id: 'a5c35621-a0d3-4bdf-a349-4bd751170cf1',
          },
        },
        null,
        []
      );

      expect(
        model.allFields.find((f) => f.value === '0|custom/1739887545268_text')
      ).toEqual(
        expect.objectContaining({
          fieldId: 'custom/1739887545268_text',
          value: '0|custom/1739887545268_text',
          defaultNestedLabel: 'Risks / Custom 1',
          defaultLabel: 'Custom 1',
          dataSourceIndex: 0,
        })
      );
    });

    it('returns possible fields for actions', () => {
      const model = TreeCustomDatasourceModel(
        { type: 'actions', children: [], fields: [] },
        {},
        null,
        []
      );
      expect(model.allFields.find((f) => f.value === '0|title')).toEqual(
        expect.objectContaining({
          fieldId: 'title',
          formConfig: {
            fieldId: 'Title',
            formId: 'action',
          },
          value: '0|title',
          defaultNestedLabel: 'Actions / Title',
          dataSourceIndex: 0,
        })
      );
    });

    it('returns possible fields for child data sources (prefixed labels)', () => {
      const model = TreeCustomDatasourceModel(
        {
          type: 'actions',
          fields: [],
          children: [{ type: 'issues', children: [], fields: [] }],
        },
        {},
        null,
        []
      );
      expect(model.allFields.find((f) => f.value === '1|departments')).toEqual(
        expect.objectContaining({
          value: '1|departments',
          fieldId: 'departments',
          defaultNestedLabel: 'Actions / Issues / Departments',
          defaultLabel: 'Departments',
          dataSourceIndex: 1,
        })
      );
    });

    it('returns possible fields for grand child data sources (prefixed labels)', () => {
      const model = TreeCustomDatasourceModel(
        {
          type: 'risks',
          fields: [],
          children: [
            {
              type: 'controls',
              children: [{ type: 'actions', children: [], fields: [] }],
              fields: [],
            },
          ],
        },
        {},
        null,
        []
      );

      expect(model.allFields.find((f) => f.value === '2|departments')).toEqual(
        expect.objectContaining({
          value: '2|departments',
          fieldId: 'departments',
          defaultNestedLabel: 'Risks / Controls / Actions / Departments',
          defaultLabel: 'Departments',
          dataSourceIndex: 2,
        })
      );
    });

    it('returns appetite status when appetite is a child of a risk', () => {
      const model = TreeCustomDatasourceModel(
        {
          type: 'risks',
          fields: [],
          children: [{ type: 'appetites', children: [], fields: [] }],
        },
        {},
        null,
        []
      );
      const status = model.allFields.find(
        (f) => f.dataSourceIndex === 1 && f.fieldId === 'status'
      );
      expect(status).toBeDefined();
    });

    it('does not return appetite status when NOT a child of a risk', () => {
      const model = TreeCustomDatasourceModel(
        {
          type: 'appetites',
          fields: [],
          children: [],
        },
        {},
        null,
        []
      );
      const status = model.allFields.find(
        (f) => f.dataSourceIndex === 0 && f.fieldId === 'status'
      );
      expect(status).toBeUndefined();
    });
  });
});
