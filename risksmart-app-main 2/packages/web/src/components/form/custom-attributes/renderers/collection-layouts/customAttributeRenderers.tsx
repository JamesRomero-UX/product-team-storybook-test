import type {
  JsonFormsCore,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  Layout,
  OwnPropsOfControl,
  UISchemaElement,
} from '@jsonforms/core';
import {
  isScoped,
  mapStateToControlProps,
  rankWith,
  scopeEndsWith,
  uiTypeIs,
} from '@jsonforms/core';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type {
  AltValueOption,
  StringOption,
} from '@risksmart-app/form-configuration/src/types';
import { isString } from 'lodash';

import type { FieldRendererProps } from './types';

interface RendererProps {
  uischema: UISchemaElement;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  renderers: JsonFormsRendererRegistryEntry[];
}
export const jsonFormsDispatchRenderer = ({
  renderers,
  rootSchema,
  schema,
  uischema,
}: RendererProps): FieldRendererProps[] => {
  if (!uischema || !schema) {
    return [];
  }

  const [renderer] = [...(renderers || [])].sort((a, b) => {
    const bTest = b.tester(uischema, schema, { rootSchema, config: {} });
    const aTest = a.tester(uischema, schema, { rootSchema, config: {} });

    return bTest - aTest;
  });
  if (renderer.tester(uischema, schema, { rootSchema, config: {} }) === -1) {
    // unknown renderer for schema
    console.error(
      'Unknown custom attribute collection renderer',
      uischema,
      schema
    );

    return [];
  }

  return renderer.renderer({
    uischema,
    schema,
    rootSchema,
    renderers,
  });
};

interface VerticalLayoutRendererProps extends RendererProps {
  uischema: Layout;
}

const collectionVerticalLayoutRenderer = ({
  uischema,
  schema,
  rootSchema,
  renderers,
}: VerticalLayoutRendererProps) => {
  if (uischema.elements.length === 0) {
    return [];
  }

  return uischema.elements.map((child) =>
    jsonFormsDispatchRenderer({
      uischema: child,
      schema,
      rootSchema,
      renderers,
    })
  );
};

const mapOptionsFromSchema = (
  schema: JsonSchema
): StringOption[] | AltValueOption[] => {
  if (!schema.enum && !schema.oneOf) {
    return [] as StringOption[];
  }

  if (schema.enum) {
    return schema.enum
      .map((value) => {
        if (isString(value)) {
          return { _tag: 'StringOption', Value: value };
        }
      })
      .filter((o): o is StringOption => o !== undefined);
  }

  return schema
    .oneOf!.map((o) => {
      if (o.const && isString(o.title)) {
        return { _tag: 'AltValueOption', AltValue: o.const, Value: o.title };
      }
    })
    .filter((o): o is AltValueOption => o !== undefined);
};

const fieldPropRenderer =
  (type: CustomAttributeFieldType) =>
  (data: OwnPropsOfControl): FieldRendererProps => {
    const contextState: JsonFormsCore = {
      data: {},
      schema: data.schema || {},
      uischema: data.uischema || ({} as UISchemaElement),
    };
    const ctx = { core: contextState, renderers: [] };
    const { label, path, schema } = mapStateToControlProps(
      { jsonforms: ctx },
      data
    );

    return {
      scope: isScoped(contextState.uischema) ? contextState.uischema.scope : '',
      label,
      altLabel: data.uischema?.options?.altLabel || undefined,
      path,
      type,
      options: mapOptionsFromSchema(schema),
    };
  };

const rendererRegistry: JsonFormsRendererRegistryEntry[] = [
  {
    tester: rankWith(3, uiTypeIs('VerticalLayout')),
    renderer: collectionVerticalLayoutRenderer,
  },
  ...Object.values(CustomAttributeFieldType).map((type) => ({
    tester: rankWith(3, scopeEndsWith('_' + type)),
    renderer: fieldPropRenderer(type),
  })),
];

export default rendererRegistry;
