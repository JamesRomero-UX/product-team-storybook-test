import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import type { CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FormEditButton from '../../form-edit-button/FormEditButton';
import { FormBuilderAddField } from '../FormBuilderAddField';
import { useFormBuilderSectionStore } from '../store/useFormBuilderSectionStore';
import { FormBuilderAction } from '../types';
import { Handle } from './Handle';

export interface ContainerProps {
  children: ReactNode;
  id: string;
  handleProps?: {
    role: string;
    tabIndex: number;
    'aria-disabled': boolean;
    'aria-pressed': boolean | undefined;
    'aria-roledescription': string;
    'aria-describedby': string;
  };
  label: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      id,
      handleProps,
      label,
      onClick,
      style,
      ...props
    }: ContainerProps,
    ref
  ) => {
    const {
      setIsEditingSection,
      setFormSectionModalAction,
      setSectionData,
      setCurrentSectionId,
    } = useFormBuilderSectionStore(
      useShallow((state) => ({
        setIsEditingSection: state.setIsEditingSection,
        setFormSectionModalAction: state.setFormSectionModalAction,
        setSectionData: state.setSectionData,
        setCurrentSectionId: state.setCurrentSectionId,
      }))
    );

    const Component = onClick ? 'button' : 'div';

    return (
      <div
        ref={ref}
        className={'w-full mb-5'}
        data-testid={'form-builder-container'}
      >
        <div className={'w-full justify-start'}>
          <FormField stretch={false}>
            <Component
              {...props}
              className={
                'flex flex-col rounded-md border ' +
                'border-solid border-grey bg-white'
              }
              style={
                {
                  ...style,
                } as CSSProperties
              }
              onClick={onClick}
              tabIndex={onClick ? 0 : undefined}
            >
              <div
                className={
                  'flex h-full items-center px-4 py-3 border-0 border-b-[1px] border-solid border-grey'
                }
              >
                <Header variant={'h2'}>{label}</Header>
                <div className={'flex gap-2 items-center'}>
                  <FormEditButton
                    onClick={() => {
                      setFormSectionModalAction(FormBuilderAction.Edit);
                      setIsEditingSection(true);
                      setSectionData({
                        sectionTitle: label,
                      });
                      setCurrentSectionId(id);
                    }}
                  />
                  <Handle {...handleProps} />
                </div>
              </div>
              <div className={'flex flex-col gap-y-3 px-4 py-3'}>
                {children}
                <div className={'flex justify-end'}>
                  <FormBuilderAddField parentId={id} />
                </div>
              </div>
            </Component>
          </FormField>
        </div>
      </div>
    );
  }
);

Container.displayName = 'Container';
