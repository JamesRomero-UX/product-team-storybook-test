import { getFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';

import { getColumnHeader } from './getColumnHeader';

describe('getColumHeader', () => {
  const formRegistry = getFormConfigRegistry([]);

  it('should return header label if specified', () => {
    const label = getColumnHeader(
      {
        formRegistry,
        formConfigurations: null,
        getEntityInfo: () => ({ singular: 'risk' }),
      },
      { header: 'Hard coded header' }
    );

    expect(label).toBe('Hard coded header');
  });

  it('should return header form registry if formId and fieldId specified', () => {
    const label = getColumnHeader(
      {
        formRegistry,
        formConfigurations: null,
        getEntityInfo: () => ({ singular: 'risk' }),
      },
      { formId: 'cause', fieldId: 'Title' }
    );

    expect(label).toBe('Title');
  });

  it('should return header from formConfiguration if available', () => {
    const label = getColumnHeader(
      {
        formRegistry,
        formConfigurations: [
          {
            ParentType: 'cause',
            fields_config: [
              {
                FieldId: 'Title',
                Label: 'Custom Title',
                Hidden: false,
                ReadOnly: false,
                Required: false,
                FormConfigurationParentType: 'cause',
              },
            ],
          },
        ],
        getEntityInfo: () => ({ singular: 'risk' }),
      },
      { formId: 'cause', fieldId: 'Title' }
    );

    expect(label).toBe('Custom Title');
  });

  it('should return form type when includeFromTypePostfix=true', () => {
    const label = getColumnHeader(
      {
        formRegistry,
        formConfigurations: [
          {
            ParentType: 'cause',
            fields_config: [
              {
                FieldId: 'Title',
                Label: 'Custom Title',
                Hidden: false,
                ReadOnly: false,
                Required: false,
                FormConfigurationParentType: 'cause',
              },
            ],
          },
        ],
        getEntityInfo: () => ({ singular: 'risk' }),
      },
      { formId: 'cause', fieldId: 'Title', includeFromTypePostfix: true }
    );

    expect(label).toBe('Custom Title (risk)');
  });
});
