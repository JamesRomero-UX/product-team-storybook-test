import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import { fieldTypesConfig } from 'src/components/form/custom-attributes/field-types';

import type { JSONObject } from '@/types/types';

import type { FieldConfig } from '../types';
import { getCustomAttributeRenderProps } from './customAttributes';

type ControlTypePrefix = 'controlled' | 'uncontrolled';

/**
 * Generates field configs for rating custom attributes, prefixed by control type.
 *
 * For each field in the schema, produces a FieldConfig where:
 * - The key is `${controlTypePrefix}__${originalPath}` (matches data keys in CustomAttributeData)
 * - The header is `${originalLabel} (${controlTypeLabel})`
 * - The cell renderer reads from the prefixed path in CustomAttributeData
 */
export const convertRatingSchemaToFieldConfigs = ({
  schema,
  controlTypePrefix,
  controlTypeLabel,
  enableRelativeDates,
}: {
  schema: CustomAttributeSchema | undefined;
  controlTypePrefix: ControlTypePrefix;
  controlTypeLabel: string;
  enableRelativeDates: boolean;
}): Record<string, FieldConfig<{ CustomAttributeData: JSONObject }>> => {
  if (!schema?.Schema || !schema?.UiSchema) {
    return {};
  }

  const renderPropsList = getCustomAttributeRenderProps(
    schema.Schema,
    schema.UiSchema
  );

  const configs: Record<
    string,
    FieldConfig<{ CustomAttributeData: JSONObject }>
  > = {};

  for (const renderProps of renderPropsList) {
    const fieldTypeConfig = fieldTypesConfig[renderProps.type];
    if (!fieldTypeConfig) {
      continue;
    }

    const prefixedPath = `${controlTypePrefix}__${renderProps.path}`;
    const prefixedRenderProps = {
      ...renderProps,
      path: prefixedPath,
    };

    const prefixedConfig = fieldTypeConfig.getTableFieldConfig(
      prefixedRenderProps,
      { enableRelativeDates }
    );

    const originalHeader =
      'header' in prefixedConfig && typeof prefixedConfig.header === 'string'
        ? prefixedConfig.header
        : renderProps.label;

    // Strip the prefix from the header if it leaked through, then add the control type suffix
    const cleanHeader = originalHeader.replace(`${controlTypePrefix}__`, '');

    configs[prefixedPath] = {
      ...prefixedConfig,
      header: `${cleanHeader} (${controlTypeLabel})`,
    };

    // Handle alt-value columns for select fields with AltValueOption
    const { options, altLabel } = renderProps;
    const useAlternateValues =
      options?.some((o) => o._tag === 'AltValueOption') || !!altLabel;

    if (useAlternateValues) {
      const altRenderProps = {
        ...renderProps,
        path: prefixedPath,
      };
      const altConfig = fieldTypeConfig.getTableFieldConfig(altRenderProps, {
        enableRelativeDates,
        useAlternateValues,
      });

      const altHeader =
        'header' in altConfig && typeof altConfig.header === 'string'
          ? altConfig.header
          : (renderProps.altLabel ?? renderProps.label);

      const cleanAltHeader = altHeader.replace(`${controlTypePrefix}__`, '');

      configs[`${prefixedPath}_alt`] = {
        ...altConfig,
        header: `${cleanAltHeader} (${controlTypeLabel})`,
        isVirtual: true,
      };
    }
  }

  return configs;
};

/**
 * Generates field configs for both inherent and residual rating custom attributes.
 */
export const convertRatingSchemasToFieldConfigs = ({
  uncontrolledSchema,
  controlledSchema,
  uncontrolledLabel,
  controlledLabel,
  enableRelativeDates,
}: {
  uncontrolledSchema: CustomAttributeSchema | undefined;
  controlledSchema: CustomAttributeSchema | undefined;
  uncontrolledLabel: string;
  controlledLabel: string;
  enableRelativeDates: boolean;
}): Record<string, FieldConfig<{ CustomAttributeData: JSONObject }>> => {
  return {
    ...convertRatingSchemaToFieldConfigs({
      schema: uncontrolledSchema,
      controlTypePrefix: 'uncontrolled',
      controlTypeLabel: uncontrolledLabel,
      enableRelativeDates,
    }),
    ...convertRatingSchemaToFieldConfigs({
      schema: controlledSchema,
      controlTypePrefix: 'controlled',
      controlTypeLabel: controlledLabel,
      enableRelativeDates,
    }),
  };
};
