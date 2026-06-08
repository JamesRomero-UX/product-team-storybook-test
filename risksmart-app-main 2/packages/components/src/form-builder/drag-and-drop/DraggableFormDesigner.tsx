import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';

import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { CustomSchemaProperty, CustomUISchemaElement } from '../types';
import { isFieldConditionallyRequired } from '../utils';
import { Container } from './Container';
import { DroppableContainer } from './DroppableContainer';
import { Item } from './Item';
import { SortableItem } from './SortableItem';
import { useDragUtils } from './useDragUtils';

export const DraggableFormDesigner = () => {
  const sensors = useSensors(useSensor(MouseSensor));
  const { collisionDetectionStrategy, recentlyMovedToNewContainer } =
    useDragUtils();

  const {
    schema,
    activeId,
    draggableItems,
    draggableSections,
    flattenedUISchemaElements,
    getUISchemaById,
    getDraggableIndex,
    onDragCancel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useFormBuilderStore(
    useShallow((state) => ({
      schema: state.schema,
      activeId: state.activeId,
      draggableItems: state.draggableItems,
      draggableSections: state.draggableSections,
      flattenedUISchemaElements: state.flattenedUISchemaElements,
      getUISchemaById: state.getUISchemaById,
      getDraggableIndex: state.getDraggableIndex,
      onDragCancel: state.onDragCancel,
      handleDragStart: state.handleDragStart,
      handleDragOver: state.handleDragOver,
      handleDragEnd: state.handleDragEnd,
    }))
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [draggableItems, recentlyMovedToNewContainer]);

  const isRequired = (id: string) => {
    return schema?.required?.includes(id) || isFieldConditionallyRequired(id);
  };

  const isSortingContainer =
    activeId !== null
      ? draggableSections.some(
          (container: CustomUISchemaElement) => container.id === activeId
        )
      : false;

  const renderSortableItemDragOverlay = (itemId: string) => {
    const localSchema =
      (schema.properties?.[itemId] as CustomSchemaProperty) || null;
    const localUISchema: CustomUISchemaElement | undefined =
      flattenedUISchemaElements.find((item) => item.id === itemId);

    if (!localUISchema || !localSchema) {
      return null;
    }

    return (
      <Item
        schema={localSchema}
        uischema={localUISchema}
        required={isRequired(itemId)}
        dragOverlay
      />
    );
  };

  const renderContainerDragOverlay = (sectionId: string) => {
    return (
      <Container
        id={sectionId}
        label={
          draggableSections.find(
            (section: CustomUISchemaElement) => section.id === sectionId
          )?.label || ''
        }
      >
        {draggableItems[sectionId].map((id) => {
          const localSchema =
            (schema?.properties?.[id] as CustomSchemaProperty) || null;
          const localUISchema = getUISchemaById(id);

          if (!localUISchema || !localSchema) {
            return null;
          }

          return (
            <>
              {localUISchema ? (
                <Item
                  key={id}
                  schema={localSchema}
                  uischema={localUISchema}
                  required={isRequired(id)}
                />
              ) : null}
            </>
          );
        })}
      </Container>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={(event) => handleDragOver(event, recentlyMovedToNewContainer)}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext
        items={draggableSections}
        strategy={verticalListSortingStrategy}
      >
        {draggableSections.length > 0
          ? draggableSections.map((section: CustomUISchemaElement) => (
              <DroppableContainer
                key={section.id}
                id={section.id}
                label={section.label || ''}
              >
                <SortableContext
                  items={draggableItems[section.id] || []}
                  strategy={verticalListSortingStrategy}
                >
                  {(draggableItems[section.id] || []).map((id, index) => {
                    const localSchema =
                      (schema?.properties?.[id] as CustomSchemaProperty) ||
                      null;
                    const localUISchema = getUISchemaById(id);

                    if (!localUISchema || !localSchema) {
                      return null;
                    }

                    return (
                      <SortableItem
                        schema={localSchema}
                        uischema={localUISchema}
                        disabled={isSortingContainer}
                        key={id}
                        id={id}
                        index={index}
                        style={() => ({})}
                        containerId={section.id}
                        getIndex={getDraggableIndex}
                        required={isRequired(id)}
                      />
                    );
                  })}
                </SortableContext>
              </DroppableContainer>
            ))
          : null}
      </SortableContext>

      {createPortal(
        <DragOverlay
          adjustScale={false}
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeId
            ? draggableSections.some(
                (section: CustomUISchemaElement) => section.id === activeId
              )
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
