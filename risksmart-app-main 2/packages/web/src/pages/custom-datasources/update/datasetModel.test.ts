import type { ControlElement } from '@jsonforms/core';
import { init } from '@risksmart-app/i18n/src/i18n';

import { DatasetModel } from './datasetModel';

describe('DatasetModel', () => {
  beforeAll(async () => {
    await init();
  });

  it('returns all standard fields', () => {
    const dataset = DatasetModel('controls', {}, null, false, []);
    const fields = dataset.fields;
    expect(fields.length).toEqual(20);
    expect(fields[0]).toEqual({
      dataType: 'date',
      displayType: 'date',
      fieldId: 'createdAtTimestamp',
      defaultLabel: 'Created on',
    });
  });

  it('returns all custom fields', () => {
    const dataset = DatasetModel(
      'controls',
      {
        control: {
          Schema: {},
          UiSchema: {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                label: 'Custom 1',
                scope: `#/properties/1739887545268_text`,
              } as ControlElement,
            ],
          },
        },
      },
      null,
      false,
      []
    );
    const fields = dataset.customAttributeFields;
    expect(fields.length).toEqual(1);
    expect(fields[0]).toEqual({
      dataType: 'text',
      displayType: 'text',
      fieldId: 'custom/1739887545268_text',
      defaultLabel: 'Custom 1',
    });
  });
});
