import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { MutableRefObject } from 'react';
import { create } from 'zustand/index';

import type {
  CustomSchema,
  CustomSchemaProperty,
  CustomUISchema,
  CustomUISchemaElement,
} from '../types';

type Items = Record<string, string[]>;
import type { ValidateFunction } from 'ajv';

import { LayoutType } from '../types';
import { validator } from '../validator';

interface FormBuilderState {
  previewFormData: unknown;
  setPreviewFormData: (formData: unknown) => void;

  validateSchema: ValidateFunction;
  setValidateSchema: (schema: CustomSchema) => void;

  schema: CustomSchema;
  setSchema: (schema: CustomSchema) => void;

  uiSchema: CustomUISchema;
  setUISchema: (uiSchema: CustomUISchema) => void;

  isPreviewingForm: boolean;
  setIsPreviewingForm: (isPreviewingForm: boolean) => void;

  isFormCustomisable: boolean;
  setIsFormCustomisable: (isFormCustomisable: boolean) => void;

  isFormDirty: boolean;
  setIsFormDirty: (isFormDirty: boolean) => void;

  isCustomising: boolean;
  setIsCustomising: (isCustomising: boolean) => void;

  activeId: null | string;
  setActiveId: (activeId: null | string) => void;

  draggableItems: Items;
  setDraggableItems: (draggableItems: Items) => void;

  clonedDraggableItems: Items | null;
  setClonedDraggableItems: (clonedDraggableItems: Items | null) => void;

  draggableSections: CustomUISchemaElement[];
  setDraggableSections: (draggableSections: CustomUISchemaElement[]) => void;

  flattenedUISchemaElements: CustomUISchemaElement[];
  setFlattenedUISchemaElements: (uiSchema: CustomUISchema) => void;
}

interface FormBuilderActions {
  setDraggablesFromUISchema: (uiSchema: CustomUISchema) => void;
  setDraggableItemsFromUISchema: (uiSchema: CustomUISchema) => void;
  setDraggableSectionsFromUISchema: (uiSchema: CustomUISchema) => void;
  findDraggableId: (id: string) => string | undefined;
  getDraggableIndex: (id: string) => number;
  getUISchemaById: (id: string) => CustomUISchemaElement | undefined;
  onDragCancel: () => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (
    event: DragOverEvent,
    ref: MutableRefObject<boolean>
  ) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const defaultSchema: CustomSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const defaultUISchema: CustomUISchema = {
  type: LayoutType.VerticalLayout,
  elements: [],
};

export type FormBuilderStore = FormBuilderState & FormBuilderActions;

export const useFormBuilderStore = create<FormBuilderStore>((set, get) => {
  return {
    previewFormData: {},
    setPreviewFormData: (formData: unknown) =>
      set({ previewFormData: formData }),

    validateSchema: validator.compile(defaultSchema),
    setValidateSchema: (schema: CustomSchema) => {
      const validateSchema = validator.compile(schema);
      set({ validateSchema });
    },

    schema: defaultSchema,
    setSchema: (schema: CustomSchema) => {
      set({ schema });
      get().setValidateSchema(schema);
    },

    uiSchema: defaultUISchema,
    setUISchema: (uiSchema: CustomUISchema) => {
      set({ uiSchema });
      get().setDraggablesFromUISchema(uiSchema);
    },

    isPreviewingForm: false,
    setIsPreviewingForm: (isPreviewingForm: boolean) =>
      set({ isPreviewingForm }),

    isFormCustomisable: false,
    setIsFormCustomisable: (isFormCustomisable: boolean) =>
      set({ isFormCustomisable }),

    isCustomising: false,
    setIsCustomising: (isCustomising: boolean) => set({ isCustomising }),

    isFormDirty: false,
    setIsFormDirty: (isFormDirty: boolean) => set({ isFormDirty }),

    activeId: null,
    setActiveId: (activeId) => set({ activeId }),

    draggableItems: {},
    setDraggableItems: (draggableItems) => set({ draggableItems }),
    setDraggableItemsFromUISchema: (uiSchema) => {
      const draggableItems: Items = (uiSchema?.elements || []).reduce(
        (acc: Items, element: CustomUISchemaElement) => {
          acc[element.id] = (element?.elements || []).map((e) => e.id);

          return acc;
        },
        {}
      );

      set({ draggableItems });
    },

    clonedDraggableItems: null,
    setClonedDraggableItems: (clonedDraggableItems) =>
      set({ clonedDraggableItems }),

    draggableSections: [],
    setDraggableSections: (draggableSections) => set({ draggableSections }),
    setDraggableSectionsFromUISchema: (uiSchema) => {
      const draggableSections = uiSchema?.elements || [];

      set({ draggableSections });
    },

    flattenedUISchemaElements: [],
    setFlattenedUISchemaElements: (uiSchema) => {
      const flattenedUISchemaElements = uiSchema?.elements.reduce(
        (acc, element: CustomUISchemaElement) => {
          return [...acc, ...(element?.elements || [])];
        },
        [] as CustomUISchemaElement[]
      );

      set({ flattenedUISchemaElements });
    },

    setDraggablesFromUISchema: (uiSchema) => {
      const {
        setDraggableItemsFromUISchema,
        setDraggableSectionsFromUISchema,
        setFlattenedUISchemaElements,
      } = get();

      setDraggableItemsFromUISchema(uiSchema);
      setDraggableSectionsFromUISchema(uiSchema);
      setFlattenedUISchemaElements(uiSchema);
    },

    findDraggableId: (id) => {
      const { draggableItems } = get();

      if (id in draggableItems) {
        return id;
      }

      return Object.keys(draggableItems).find((key) =>
        draggableItems[key].includes(id)
      );
    },

    getDraggableIndex: (id) => {
      const { draggableItems, findDraggableId } = get();

      const draggableId = findDraggableId(id);

      if (!draggableId) {
        return -1;
      }

      return draggableItems[draggableId].indexOf(id);
    },

    getUISchemaById: (id) => {
      return get().flattenedUISchemaElements.find((item) => item.id === id);
    },

    onDragCancel: () => {
      const { clonedDraggableItems } = get();

      if (clonedDraggableItems) {
        set({ draggableItems: clonedDraggableItems });
      }

      set({ activeId: null, clonedDraggableItems: null });
    },

    handleDragStart: ({ active }) => {
      const { draggableItems } = get();

      set({ activeId: `${active.id}`, clonedDraggableItems: draggableItems });
    },

    handleDragOver: ({ active, over }, ref) => {
      const { draggableItems, findDraggableId } = get();

      const activeId = `${active.id}`;
      const overId = `${over?.id}`;

      if (!overId || activeId in draggableItems) {
        return;
      }

      const overContainerId = findDraggableId(overId);
      const activeContainerId = findDraggableId(activeId);

      if (!overContainerId || !activeContainerId) {
        return;
      }

      if (activeContainerId !== overContainerId) {
        const activeItems = draggableItems[activeContainerId];
        const overItems = draggableItems[overContainerId];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(activeId);

        let newIndex: number;

        if (overId in draggableItems) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        ref.current = true;

        const newDraggableItems = {
          ...draggableItems,
          [activeContainerId]: draggableItems[activeContainerId].filter(
            (item) => item !== activeId
          ),
          [overContainerId]: [
            ...draggableItems[overContainerId].slice(0, newIndex),
            draggableItems[activeContainerId][activeIndex],
            ...draggableItems[overContainerId].slice(
              newIndex,
              draggableItems[overContainerId].length
            ),
          ],
        };

        set({ draggableItems: newDraggableItems });
      }
    },

    handleDragEnd: ({ active, over }) => {
      const { draggableItems, draggableSections, findDraggableId, uiSchema } =
        get();

      const activeId = `${active.id}`;
      const overId = `${over?.id}`;

      if (activeId in draggableItems && overId) {
        const activeIndex = draggableSections.findIndex(
          (section: CustomUISchemaElement) => section.id === activeId
        );

        const overIndex = draggableSections.findIndex(
          (section: CustomUISchemaElement) => section.id === overId
        );

        const newDraggableSections = arrayMove(
          draggableSections,
          activeIndex,
          overIndex
        );

        set({ draggableSections: newDraggableSections });
      }

      const activeContainer = findDraggableId(activeId);

      if (!activeContainer || !overId) {
        set({ activeId: null });

        return;
      }

      const overContainer = findDraggableId(overId);

      if (overContainer) {
        const activeIndex = draggableItems[activeContainer].indexOf(activeId);
        const overIndex = draggableItems[overContainer].indexOf(overId);

        if (activeIndex !== overIndex) {
          const newDraggableItems = {
            ...draggableItems,
            [overContainer]: arrayMove(
              draggableItems[overContainer],
              activeIndex,
              overIndex
            ),
          };

          set({ draggableItems: newDraggableItems });
        }
      }

      set({ activeId: null });

      const newUISchemaElements: CustomUISchemaElement[] =
        get().draggableSections.map((section) => {
          const { draggableItems } = get();

          const newSectionElementsOrder = (
            draggableItems[section.id] || []
          ).sort((a, b) => {
            const aIndex = draggableItems[section.id].indexOf(a);
            const bIndex = draggableItems[section.id].indexOf(b);

            return aIndex - bIndex;
          });

          const newSectionElements: (CustomUISchemaElement | undefined)[] =
            newSectionElementsOrder.map((id) => {
              const newUISchema = get().getUISchemaById(id);

              if (!newUISchema) {
                return undefined;
              }

              return {
                ...newUISchema,
                parentId: section.id,
              };
            });

          const filteredNewSectionElements: CustomUISchemaElement[] =
            newSectionElements.filter((element) => element !== undefined);

          return {
            ...section,
            elements: filteredNewSectionElements,
          };
        });

      get().setUISchema({
        ...uiSchema,
        elements: newUISchemaElements,
      });

      if (activeId && overContainer) {
        const { schema, setSchema } = get();
        const schemaProperties = schema.properties || {};
        const newSchemaProperty = {
          ...schema,
          properties: {
            ...schemaProperties,
            [activeId]: {
              ...schemaProperties[activeId],
              parentId: overContainer,
            },
          },
        } as CustomSchemaProperty;

        setSchema(newSchemaProperty);
      }
    },
  };
});
