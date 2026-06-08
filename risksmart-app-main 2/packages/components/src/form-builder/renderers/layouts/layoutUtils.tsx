import type {
  HorizontalLayout,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  VerticalLayout,
} from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import type { FC } from 'react';

import type { CustomUISchemaElement } from '../../types';

export interface RenderChildrenProps {
  layout: CustomUISchemaElement | HorizontalLayout | VerticalLayout;
  schema: JsonSchema;
  path: string;
  renderers: JsonFormsRendererRegistryEntry[] | undefined;
  cells: JsonFormsCellRendererRegistryEntry[] | undefined;
  enabled: boolean;
}

export const RenderChildren: FC<RenderChildrenProps> = ({
  layout,
  schema,
  path,
  renderers,
  cells,
  enabled,
}) => {
  if (layout?.elements?.length === 0) {
    return [];
  }

  return layout?.elements
    ? layout.elements.map((child, index) => {
        return (
          <div
            key={`${path}-${index}`}
            data-testid={`form-builder-field-${index}`}
          >
            <JsonFormsDispatch
              renderers={renderers}
              cells={cells}
              uischema={child}
              schema={schema}
              path={path}
              enabled={enabled}
            />
          </div>
        );
      })
    : null;
};
