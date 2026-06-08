import type { QueryConfig } from '../db';

/**
 * Query configuration for form configurations
 * Returns form configuration with related custom attribute schema,
 * field configurations, and user information
 */
export const getFormConfigurationQueryConfig = {
  columns: {
    ParentType: true,
    CreatedByUser: false,
    ModifiedByUser: false,
    OrgKey: false,
    CustomAttributeSchemaId: false,
  },
  with: {
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    } as const satisfies QueryConfig<'user_view_active'>,
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    } as const satisfies QueryConfig<'user_view_active'>,
    customAttributeSchema: {
      columns: {
        Id: true,
        UiSchema: true,
        Schema: true,
      },
    } as const satisfies QueryConfig<'custom_attribute_schema'>,
    fields_config: {
      columns: {
        FieldId: true,
        Hidden: true,
        Required: true,
        ReadOnly: true,
        DefaultValue: true,
        FormConfigurationParentType: true,
        Label: true,
        Description: true,
        Conditions: true,
      },
    } as const satisfies QueryConfig<'form_field_configuration'>,
  },
} as const satisfies QueryConfig<'form_configuration'>;
