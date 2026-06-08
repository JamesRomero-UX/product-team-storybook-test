import type { RendererProps, VerticalLayout } from '@jsonforms/core';
import { useJsonForms } from '@jsonforms/react';
import type { FunctionComponent } from 'react';
import React from 'react';

import { RenderChildren } from './layoutUtils';

export const VerticalLayoutRenderer = (props: RendererProps) => {
  const { data: _data, ...otherProps } = props;

  // We don't hand over data to the layout renderer to avoid re-rendering it with every data change
  return <VerticalLayoutRendererComponent {...otherProps} />;
};

const VerticalLayoutRendererComponent: FunctionComponent<RendererProps> =
  React.memo(function VerticalLayoutRendererComponent({
    schema,
    uischema,
    path,
    visible,
    enabled,
  }: RendererProps) {
    const { renderers, cells } = useJsonForms();

    const layout = uischema as VerticalLayout;

    return (
      <div
        data-testid={'vertical-layout'}
        hidden={visible === undefined || visible === null ? false : !visible}
      >
        <RenderChildren
          layout={layout}
          renderers={renderers}
          cells={cells}
          schema={schema}
          path={path}
          enabled={enabled}
        />
      </div>
    );
  });
