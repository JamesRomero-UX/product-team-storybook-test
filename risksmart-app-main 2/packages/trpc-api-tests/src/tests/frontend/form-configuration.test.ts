import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import {
  buildCustomAttributeSchema,
  buildFormConfiguration,
  insertCustomAttributeSchema,
  insertFormConfiguration,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('form-configuration', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getByParentTypes', () => {
    it('getByParentTypes query should return form configurations matching parent types', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      // Create form configuration for Risk parent type
      const riskFormConfiguration = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
      });

      const insertedRiskConfig = await insertFormConfiguration(
        riskFormConfiguration
      );

      if (!insertedRiskConfig) {
        throw new Error('Failed to insert risk form configuration');
      }

      // Create form configuration for Control parent type
      const controlFormConfiguration = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Control,
      });

      const insertedControlConfig = await insertFormConfiguration(
        controlFormConfiguration
      );

      if (!insertedControlConfig) {
        throw new Error('Failed to insert control form configuration');
      }

      // Query for Risk parent type only
      const response =
        await trpcClient.frontend.formConfiguration.getByParentTypes.query({
          parentTypes: [ParentTypes.Risk],
        });

      expect(response.length).toEqual(1);
      const config = response[0]!;
      expect(config.createdByUser?.FriendlyName).toEqual(
        insertedUser?.FriendlyName
      );
      expect(config.modifiedByUser?.FriendlyName).toEqual(
        insertedUser?.FriendlyName
      );
    });

    it('getByParentTypes query should return multiple form configurations for multiple parent types', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create form configurations for Risk and Control parent types
      const riskFormConfiguration = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
      });
      const controlFormConfiguration = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Control,
      });

      await insertFormConfiguration(riskFormConfiguration);
      await insertFormConfiguration(controlFormConfiguration);

      // Query for both Risk and Control parent types
      const response =
        await trpcClient.frontend.formConfiguration.getByParentTypes.query({
          parentTypes: [ParentTypes.Risk, ParentTypes.Control],
        });

      expect(response.length).toEqual(2);

      const parentTypes = response.map((config) => config.ParentType);
      expect(parentTypes).toContain(ParentTypes.Risk);
      expect(parentTypes).toContain(ParentTypes.Control);
    });

    it('getByParentTypes query should return empty array when no configurations match', async () => {
      const { trpcClient } = context;

      // Query for a parent type that doesn't have a form configuration
      const response =
        await trpcClient.frontend.formConfiguration.getByParentTypes.query({
          parentTypes: [ParentTypes.Issue],
        });

      expect(response.length).toEqual(0);
    });
  });

  describe('createFormField', () => {
    it('should create a new custom form field', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a form configuration first
      const formConfig = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
      });
      await insertFormConfiguration(formConfig);

      // Create a custom form field
      const response =
        await trpcClient.frontend.formConfiguration.createFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Risk,
          Label: 'Test Custom Field',
          Type: CustomAttributeFieldType.Text,
          Options: [],
          Required: false,
          Hidden: false,
          ReadOnly: false,
        });

      expect(response.Id).toBeDefined();
      expect(response.Id).toContain('CustomAttributeData.');
    });

    it('should create a custom form field with options', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a form configuration first
      const formConfig = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Control,
      });
      await insertFormConfiguration(formConfig);

      // Create a dropdown custom field with options
      const response =
        await trpcClient.frontend.formConfiguration.createFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Control,
          Label: 'Priority Level',
          Type: CustomAttributeFieldType.Select,
          Options: [
            { _tag: 'StringOption', Value: 'Low' },
            { _tag: 'StringOption', Value: 'Medium' },
            { _tag: 'StringOption', Value: 'High' },
          ],
          Required: true,
          Hidden: false,
          ReadOnly: false,
        });

      expect(response.Id).toBeDefined();
    });

    it('should create a custom form field without existing form configuration', async () => {
      const { trpcClient } = context;

      // Create a custom form field without pre-existing form configuration
      // The data layer should create the form configuration automatically
      const response =
        await trpcClient.frontend.formConfiguration.createFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Obligation,
          Label: 'Custom Notes',
          Type: CustomAttributeFieldType.Text,
          Options: [],
          Required: false,
          Hidden: false,
          ReadOnly: false,
          Description: 'Additional notes for the obligation',
        });

      expect(response.Id).toBeDefined();
    });
  });

  describe('updateFormField', () => {
    it('should update a standard form field configuration', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a form configuration first
      const formConfig = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
      });
      await insertFormConfiguration(formConfig);

      // Update a standard field (like "Title")
      const response =
        await trpcClient.frontend.formConfiguration.updateFormField.mutate({
          IsCustomField: false,
          ParentType: ParentTypes.Risk,
          FieldId: 'Title',
          Label: 'Risk Name',
          Description: 'The name of the risk',
          Required: true,
          Hidden: false,
          ReadOnly: false,
        });

      expect(response.Id).toBeDefined();
      expect(response.Id).toEqual('Title');
    });

    it('should update a custom form field', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a form configuration first
      const formConfig = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
      });
      await insertFormConfiguration(formConfig);

      // First create a custom field
      const createResponse =
        await trpcClient.frontend.formConfiguration.createFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Risk,
          Label: 'Original Label',
          Type: CustomAttributeFieldType.Text,
          Options: [],
          Required: false,
          Hidden: false,
          ReadOnly: false,
        });

      // Then update it
      const updateResponse =
        await trpcClient.frontend.formConfiguration.updateFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Risk,
          FieldId: createResponse.Id,
          Label: 'Updated Label',
          Options: [],
          Required: true,
          Hidden: false,
          ReadOnly: false,
          Description: 'Updated description',
        });

      expect(updateResponse.Id).toEqual(createResponse.Id);
    });
  });

  describe('deleteFormField', () => {
    it('should delete a custom form field', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a form configuration with a custom attribute schema
      const customAttrSchema = buildCustomAttributeSchema(orgKey, userId);
      await insertCustomAttributeSchema(customAttrSchema);

      const formConfig = buildFormConfiguration(orgKey, userId, {
        ParentType: ParentTypes.Risk,
        CustomAttributeSchemaId: customAttrSchema.Id,
      });
      await insertFormConfiguration(formConfig);

      // First create a custom field
      const createResponse =
        await trpcClient.frontend.formConfiguration.createFormField.mutate({
          IsCustomField: true,
          ParentType: ParentTypes.Risk,
          Label: 'Field To Delete',
          Type: CustomAttributeFieldType.Text,
          Options: [],
          Required: false,
          Hidden: false,
          ReadOnly: false,
        });

      // Delete the custom field (returns void on success)
      await trpcClient.frontend.formConfiguration.deleteFormField.mutate({
        ParentType: ParentTypes.Risk,
        FieldId: createResponse.Id,
      });

      // Verify deletion by fetching form configuration and checking field is gone
      const formConfigs =
        await trpcClient.frontend.formConfiguration.getByParentTypes.query({
          parentTypes: [ParentTypes.Risk],
        });

      const riskConfig = formConfigs.find(
        (c) => c.ParentType === ParentTypes.Risk
      );
      const deletedField = riskConfig?.fields_config?.find(
        (f) => f.FieldId === createResponse.Id
      );

      expect(deletedField).toBeUndefined();
    });
  });
});
