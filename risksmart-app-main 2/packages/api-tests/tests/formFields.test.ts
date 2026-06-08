import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  buildInsertFormFieldApi,
  buildUpdateFormFieldApi,
} from '../data/formFields';
import type { ParentTypeEnum } from '../generated/graphql';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('formFields', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('insert', () => {
    it('Can insert a form text field (adds a custom attribute)', async () => {
      const formField = buildInsertFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'default value',
        Required: true,
      });
      const { insertFormField } = await apiClient.insertFormField(
        {
          object: formField,
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(insertFormField!.Id).toBeDefined();
      expect(insertFormField!.Id).toMatch(/^CustomAttributeData.\d+_text$/);

      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: formField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration.length).toBe(1);
      expect(form_configuration[0].ParentType).toBe(formField.ParentType);
      expect(form_configuration[0].customAttributeSchema).toBeDefined();
      expect(form_configuration[0].customAttributeSchema?.Id).toBeDefined();

      // Assert json schema is correct.
      const schema = form_configuration[0].customAttributeSchema?.Schema;
      const path = insertFormField!.Id.replace('CustomAttributeData.', '');
      expect(schema).toEqual({
        properties: {
          [path]: { description: '', type: 'string' },
        },
      });

      expect(form_configuration[0].customAttributeSchema?.UiSchema).toEqual({
        elements: [
          {
            label: 'New field 1',
            scope: `#/properties/${path}`,
            type: 'Control',
          },
        ],
        type: 'VerticalLayout',
      });

      expect(form_configuration[0].fields_config).toEqual([
        {
          FieldId: insertFormField!.Id,
          Hidden: false,
          Required: true,
          ReadOnly: true,
          Description: null,
          DefaultValue: 'default value',
          __typename: 'form_field_configuration',
        },
      ]);
    });

    it('Removed dangerous content from description', async () => {
      const formField = buildInsertFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'default value',
        Required: true,
        Type: 'select',
        Options: [
          { _tag: 'StringOption', Value: 'Option1' },
          { _tag: 'StringOption', Value: 'Option2' },
        ],
        Description: '<div onclick="stealBankDetails()">Hello world</div>',
      });
      const { insertFormField } = await apiClient.insertFormField(
        {
          object: formField,
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(insertFormField!.Id).toBeDefined();
      expect(insertFormField!.Id).toMatch(/^CustomAttributeData.\d+_select$/);

      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: formField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(form_configuration[0].fields_config).toEqual([
        expect.objectContaining({
          Description: '<div>Hello world</div>',
        }),
      ]);
    });

    it('Can insert a form select field (adds a custom attribute)', async () => {
      const formField = buildInsertFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'default value',
        Required: true,
        Type: 'select',
        Options: [
          { _tag: 'StringOption', Value: 'Option1' },
          { _tag: 'StringOption', Value: 'Option2' },
        ],
      });
      const { insertFormField } = await apiClient.insertFormField(
        {
          object: formField,
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(insertFormField!.Id).toBeDefined();
      expect(insertFormField!.Id).toMatch(/^CustomAttributeData.\d+_select$/);

      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: formField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration.length).toBe(1);
      expect(form_configuration[0].ParentType).toBe(formField.ParentType);
      expect(form_configuration[0].customAttributeSchema).toBeDefined();
      expect(form_configuration[0].customAttributeSchema?.Id).toBeDefined();

      // Assert json schema is correct.
      const schema = form_configuration[0].customAttributeSchema?.Schema;
      const path = insertFormField!.Id.replace('CustomAttributeData.', '');
      expect(schema).toEqual({
        properties: {
          [path]: {
            description: '',
            type: 'string',
            enum: ['Option1', 'Option2'],
          },
        },
      });

      expect(form_configuration[0].customAttributeSchema?.UiSchema).toEqual({
        elements: [
          {
            label: 'New field 1',
            scope: `#/properties/${path}`,
            type: 'Control',
          },
        ],
        type: 'VerticalLayout',
      });

      expect(form_configuration[0].fields_config).toEqual([
        {
          FieldId: insertFormField!.Id,
          Hidden: false,
          Required: true,
          ReadOnly: true,
          Description: null,
          DefaultValue: 'default value',
          __typename: 'form_field_configuration',
        },
      ]);
    });
  });

  describe('update', () => {
    it('Can update a standard field', async () => {
      const updatedField = buildUpdateFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'updated default value',
        Required: false,
        FieldId: 'Title',
        Label: 'Updated label 1',
        IsCustomField: false,
      });
      await apiClient.updateFormField(
        {
          object: updatedField,
        },
        {
          user: riskManagerUser1,
        }
      );
      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: updatedField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration.length).toBe(1);
      expect(form_configuration[0].ParentType).toBe(updatedField.ParentType);
      expect(form_configuration[0].customAttributeSchema).toBeDefined();
      expect(form_configuration[0].customAttributeSchema?.Id).toBeDefined();

      const schema = form_configuration[0].customAttributeSchema?.Schema;

      expect(schema).toEqual({});

      expect(form_configuration[0].customAttributeSchema?.UiSchema).toEqual({
        elements: [],
        type: 'VerticalLayout',
      });

      expect(form_configuration[0].fields_config).toEqual([
        {
          FieldId: updatedField.FieldId,
          Hidden: false,
          Required: false,
          ReadOnly: true,
          Description: null,
          DefaultValue: 'updated default value',
          __typename: 'form_field_configuration',
        },
      ]);
    });

    it('Removes dangerous html from description', async () => {
      const updatedField = buildUpdateFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'updated default value',
        Required: false,
        FieldId: 'Title',
        Label: 'Updated label 1',
        IsCustomField: false,
        Description: '<div onclick="stealBankDetails()">Hello world</div>',
      });
      await apiClient.updateFormField(
        {
          object: updatedField,
        },
        {
          user: riskManagerUser1,
        }
      );
      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: updatedField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration[0].fields_config).toEqual([
        expect.objectContaining({
          Description: '<div>Hello world</div>',
        }),
      ]);
    });

    it('Can update a custom attribute', async () => {
      const formField = buildInsertFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'default value',
        Required: true,
      });
      const { insertFormField } = await apiClient.insertFormField(
        {
          object: formField,
        },
        {
          user: riskManagerUser1,
        }
      );
      const customAttributeId = insertFormField!.Id;

      const updatedField = buildUpdateFormFieldApi({
        ReadOnly: false,
        Description: null,
        DefaultValue: 'updated default value',
        Required: false,
        FieldId: customAttributeId,
        Label: 'Updated label 1',
        IsCustomField: true,
      });
      await apiClient.updateFormField(
        {
          object: updatedField,
        },
        {
          user: riskManagerUser1,
        }
      );

      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: formField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration.length).toBe(1);
      expect(form_configuration[0].ParentType).toBe(formField.ParentType);
      expect(form_configuration[0].customAttributeSchema).toBeDefined();
      expect(form_configuration[0].customAttributeSchema?.Id).toBeDefined();

      // Assert json schema is correct.
      const schema = form_configuration[0].customAttributeSchema?.Schema;
      const path = insertFormField!.Id.replace('CustomAttributeData.', '');
      expect(schema).toEqual({
        properties: {
          [path]: { description: '', type: 'string' },
        },
      });

      expect(form_configuration[0].customAttributeSchema?.UiSchema).toEqual({
        elements: [
          {
            label: updatedField.Label,
            scope: `#/properties/${path}`,
            type: 'Control',
          },
        ],
        type: 'VerticalLayout',
      });

      expect(form_configuration[0].fields_config).toEqual([
        {
          FieldId: insertFormField!.Id,
          Hidden: updatedField.Hidden,
          Required: updatedField.Required,
          ReadOnly: updatedField.ReadOnly,
          DefaultValue: updatedField.DefaultValue,
          Description: null,
          __typename: 'form_field_configuration',
        },
      ]);
    });
  });

  describe('delete', () => {
    it('Can delete a custom attribute', async () => {
      const formField = buildInsertFormFieldApi({
        ReadOnly: true,
        DefaultValue: 'default value',
        Required: true,
      });
      const { insertFormField } = await apiClient.insertFormField(
        {
          object: formField,
        },
        {
          user: riskManagerUser1,
        }
      );
      const customAttributeId = insertFormField!.Id;
      await apiClient.deleteFormField(
        {
          object: {
            FieldId: customAttributeId,
            ParentType: formField.ParentType,
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      const { form_configuration } = await apiClient.getFormConfiguration(
        {
          where: {
            ParentType: { _eq: formField.ParentType as ParentTypeEnum },
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(form_configuration.length).toBe(1);
      expect(form_configuration[0].ParentType).toBe(formField.ParentType);
      expect(form_configuration[0].customAttributeSchema).toBeDefined();
      expect(form_configuration[0].customAttributeSchema?.Id).toBeDefined();

      // Assert json schema is correct.
      const schema = form_configuration[0].customAttributeSchema?.Schema;

      expect(schema).toEqual({ properties: {}, required: [] });

      expect(form_configuration[0].customAttributeSchema?.UiSchema).toEqual({
        elements: [],
        type: 'VerticalLayout',
      });

      expect(form_configuration[0].fields_config).toEqual([]);
    });
  });
});
