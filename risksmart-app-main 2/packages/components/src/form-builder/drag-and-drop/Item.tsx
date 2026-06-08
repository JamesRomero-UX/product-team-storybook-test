import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { JsonForms } from '@jsonforms/react';
import type { CSSProperties } from 'react';
import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FormEditButton from '../../form-edit-button/FormEditButton';
import { rendererRegistry } from '../renderers/registry';
import { useFormBuilderFieldStore } from '../store/useFormBuilderFieldStore';
import type { CustomSchemaProperty, CustomUISchemaElement } from '../types';
import { emptyPropertyFilterQuery } from '../types';
import { type FieldConfigData, FormBuilderAction } from '../types';
import { usesItemsOneOf, usesOneOf } from '../utils';
import { Handle } from './Handle';
import styles from './style.module.scss';

export interface Props {
  schema: CustomSchemaProperty;
  uischema: CustomUISchemaElement;
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handleProps?: { ref: (element: HTMLElement | null) => void };
  index?: number;
  fadeIn?: boolean;
  transform?: null | Transform;
  listeners?: DraggableSyntheticListeners;
  style?: CSSProperties;
  transition?: null | string;
  required?: boolean;
}

export const Item = React.memo(
  React.forwardRef<HTMLDivElement, Props>(
    (
      {
        schema,
        uischema,
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handleProps,
        index,
        listeners,
        style,
        transition,
        transform,
        required,
        ...props
      },
      ref
    ) => {
      const hasRule = uischema?.rule;
      const uiSchemaWithoutRule = hasRule
        ? {
            ...uischema,
            rule: undefined,
            options: {
              ...uischema.options,
              showConditionalIndicator: true,
              isDesignMode: true,
            },
          }
        : uischema;

      const {
        setFormFieldModalAction,
        setIsEditingField,
        setFieldConfigData,
        setParentId,
        setCurrentFieldId,
      } = useFormBuilderFieldStore(
        useShallow((state) => ({
          setFormFieldModalAction: state.setFormFieldModalAction,
          setIsEditingField: state.setIsEditingField,
          setFieldConfigData: state.setFieldConfigData,
          setParentId: state.setParentId,
          setCurrentFieldId: state.setCurrentFieldId,
        }))
      );

      const setInitialSelectedOptions = () => {
        if (usesOneOf(uischema?.options?.fieldType)) {
          return (
            (schema?.oneOf || []).map((item) => {
              return {
                value: item?.title || '',
                generatedId: item?.const || '',
              };
            }) || []
          );
        }

        if (usesItemsOneOf(uischema?.options?.fieldType)) {
          return (
            (schema?.items?.oneOf || []).map((item) => {
              return {
                value: item?.title || '',
                generatedId: item?.const || '',
              };
            }) || []
          );
        }

        return [];
      };

      const initialFieldData: FieldConfigData = {
        fieldTitle: uischema?.label ? `${uischema.label}` : '',
        description: uischema?.options?.description || '',
        placeholder: uischema?.options?.placeholder
          ? uischema.options.placeholder
          : '',
        fieldType: uischema?.options?.fieldType || 'text',
        selectOptions: setInitialSelectedOptions(),
        isPropertyRequired: required || false,
        allowAttachments: schema?.allowAttachments || false,
        isConditional: schema?.isConditional || false,
        conditionalOptions:
          schema?.conditionalOptions || emptyPropertyFilterQuery,
      };

      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';

        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return (
        <div
          data-testid={`form-builder-section-${index}`}
          ref={ref}
          className={
            `${styles.Wrapper} ` +
            `${fadeIn ? styles.fadeIn : ''} ` +
            `${dragOverlay ? styles.dragOverlay : ''}`
          }
          style={
            {
              transition: [transition].filter(Boolean).join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
              '--color': color,
            } as React.CSSProperties
          }
        >
          <div
            className={
              `${styles.Item} ${color ? styles.color : ''} ` +
              `${dragging ? styles.dragging : ''} ` +
              `${dragOverlay ? styles.dragOverlay : ''} ` +
              `${disabled ? styles.disabled : ''} `
            }
            style={style}
            data-cypress={'draggable-item'}
            {...props}
          >
            <div className={'flex w-full justify-between items-center gap-4'}>
              <JsonForms
                data={{}}
                readonly={true}
                uischema={uiSchemaWithoutRule}
                schema={schema}
                renderers={rendererRegistry}
              />
              <div className={'flex items-center gap-2'}>
                <FormEditButton
                  onClick={() => {
                    setFormFieldModalAction(FormBuilderAction.Edit);
                    setParentId(uischema?.parentId || '');
                    setCurrentFieldId(uischema.id);
                    setFieldConfigData(initialFieldData);
                    setIsEditingField(true);
                  }}
                />
                <Handle {...handleProps} {...listeners} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  )
);
