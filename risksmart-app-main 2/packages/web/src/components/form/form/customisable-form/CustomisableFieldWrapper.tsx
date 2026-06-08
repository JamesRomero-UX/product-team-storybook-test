import { useMutation } from '@apollo/client';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  InsertFormFieldPositionsDocument,
  UpdateFormFieldPositionsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactElement, ReactNode } from 'react';
import {
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { evictField } from '@/utils/graphqlUtils';

import useControlledCustomAttributes from '../../custom-attributes/useControlledCustomAttributes';
import { ConditionalFieldsProvider } from '../conditional-fields-provider/ConditionalFieldsProvider';
import { useCustomisableFormDataContext } from '../customisable-form-data/CustomisableFormDataContext';
import DraggableField from './DraggableField';
import { useElementsOrder } from './hooks/useElementsOrder';
import { useTransformSchemaToRequiredFields } from './hooks/useTransformSchemaToRequiredFields';
import { useRiskSmartForm } from './RiskSmartFormContext';
import style from './style.module.scss';

type Props = {
  children: ReactNode | ReactNode[];
  readOnly?: boolean;
};

/**
 * Wraps a forms fields to support customisation of the order
 * @returns
 */
const CustomisableFieldWrapper: FC<Props> = ({
  children: childrenProp,
  readOnly,
}) => {
  const { parentType, editMode } = useRiskSmartForm();

  if (!parentType) {
    throw new Error(
      'CustomisableForm must have a parentType on the RiskSmartFormProvider'
    );
  }

  const [updateFormFieldPositions] = useMutation(
    UpdateFormFieldPositionsDocument,
    {
      update: (cache) => {
        evictField(cache, 'form_configuration');
        evictField(cache, 'form_field_ordering');
      },
    }
  );
  const [insertFormFieldPositions] = useMutation(
    InsertFormFieldPositionsDocument,
    {
      update: (cache) => {
        evictField(cache, 'form_configuration');
        evictField(cache, 'form_field_ordering');
      },
    }
  );

  const customAttributeElements = useControlledCustomAttributes({
    readOnly,
  });

  const { formFieldOrdering, customAttributeSchema } =
    useCustomisableFormDataContext();
  const childrenArray = Array.isArray(childrenProp)
    ? childrenProp
    : [childrenProp];
  const children = [...childrenArray, ...customAttributeElements];

  const elementsByKey = (
    children.filter((c) => isValidElement(c)) as ReactElement[]
  ).map((element) => {
    if (!element.key) {
      throw new Error(
        `All children of a CustomisableForm must have a unique 'key' prop, ${
          (element.props as { name?: string }).name ?? 'a child'
        } does not have one.`
      );
    }

    return {
      key: String(element.key),
      value: element,
    };
  });

  if (elementsByKey.some((e, i) => elementsByKey.indexOf(e) !== i)) {
    throw new Error("CustomisableForm's children must have unique 'key' props");
  }

  useTransformSchemaToRequiredFields(parentType);

  const { elementsOrder, visibleElements, setElementsOrder } = useElementsOrder(
    elementsByKey,
    formFieldOrdering ?? undefined
  );

  const isUpdate = !!customAttributeSchema;

  const saveFields = useCallback(async () => {
    if (!parentType || !elementsOrder) {
      return;
    }

    const mutateFn = isUpdate
      ? updateFormFieldPositions
      : insertFormFieldPositions;

    await mutateFn({
      variables: {
        fieldConfig: elementsOrder.map((key, i) => ({
          FormConfigurationParentType: isUpdate ? parentType : undefined,
          FieldId: key,
          Position: i,
          form: null,
        })),
        fieldIds: elementsOrder.map((key) => key),
        parentType,
      },
    });
  }, [
    elementsOrder,
    parentType,
    updateFormFieldPositions,
    insertFormFieldPositions,
    isUpdate,
  ]);

  const { setOnSave } = useRiskSmartForm();

  useEffect(() => {
    if (editMode) {
      setOnSave(() => saveFields);
    }

    return () => setOnSave(undefined);
  }, [saveFields, setOnSave, editMode]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = elementsOrder.indexOf(String(active.id));
        const newIndex = elementsOrder.indexOf(String(over.id));
        setElementsOrder(arrayMove(elementsOrder, oldIndex, newIndex));
      }
    },
    [elementsOrder, setElementsOrder]
  );

  const activeElement = activeId
    ? elementsByKey.find((e) => e.key === activeId)?.value
    : null;

  if (!editMode) {
    return (
      <div data-testid={'customisable-form-content'} className={'m-0 p-0'}>
        <div>
          {visibleElements
            ?.filter(
              (key) => elementsByKey.find((e) => e.key === key)?.value !== null
            )
            .map((key) => (
              <Fragment key={key}>
                {elementsByKey.find((e) => e.key === key)?.value}
              </Fragment>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid={'customisable-form-content'} className={'m-0 p-0'}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={elementsOrder}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {visibleElements
              ?.filter(
                (key) =>
                  elementsByKey.find((e) => e.key === key)?.value !== null
              )
              .map((key) => (
                <DraggableField key={key} id={key} isDraggable={editMode}>
                  {elementsByKey.find((e) => e.key === key)?.value}
                </DraggableField>
              ))}
          </div>
        </SortableContext>
        {createPortal(
          <DragOverlay dropAnimation={null} style={{ zIndex: 9999 }}>
            {activeElement ? (
              <div
                className={`relative bg-white rounded-md flex items-center break-all border-2 border-solid border-teal cursor-grabbing shadow-xl mb-3 p-5 ${style.grabbing}`}
              >
                <div className={`flex-1 ${style.children}`}>
                  {activeElement}
                </div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

const CustomisableFieldWrapperWithConditionalProvider: FC<Props> = (props) => (
  <ConditionalFieldsProvider>
    <CustomisableFieldWrapper {...props} />
  </ConditionalFieldsProvider>
);

export default CustomisableFieldWrapperWithConditionalProvider;
