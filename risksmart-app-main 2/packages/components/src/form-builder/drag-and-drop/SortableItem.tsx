import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import type { CSSProperties } from 'react';

import type { CustomSchemaProperty, CustomUISchemaElement } from '../types';
import { Item } from './Item';

interface SortableItemProps {
  schema: CustomSchemaProperty;
  uischema: CustomUISchemaElement;
  containerId: string;
  id: string;
  index: number;
  disabled?: boolean;
  required?: boolean;
  style: (args: {
    index: number;
    value: string;
    isDragging: boolean;
    overIndex: number;
    containerId: string;
  }) => CSSProperties;
  getIndex(id: UniqueIdentifier): number;
}

export function SortableItem({
  schema,
  uischema,
  disabled,
  id,
  index,
  style,
  containerId,
  getIndex,
  required,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <Item
      schema={schema}
      uischema={uischema}
      ref={disabled ? undefined : setNodeRef}
      dragging={isDragging}
      handleProps={{ ref: setActivatorNodeRef }}
      index={index}
      style={style({
        index,
        value: id,
        isDragging,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      transition={transition}
      transform={transform}
      listeners={listeners}
      required={required}
    />
  );
}
