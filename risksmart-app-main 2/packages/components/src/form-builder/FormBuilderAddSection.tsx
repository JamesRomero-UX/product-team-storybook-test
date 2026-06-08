import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { defaultSectionData } from './form-configs/section';
import { useFormBuilderSectionStore } from './store/useFormBuilderSectionStore';
import { FormBuilderAction } from './types';

export const FormBuilderAddSection: FC = () => {
  const { setFormSectionModalAction, setIsEditingSection, setSectionData } =
    useFormBuilderSectionStore(
      useShallow((state) => ({
        setFormSectionModalAction: state.setFormSectionModalAction,
        setIsEditingSection: state.setIsEditingSection,
        setSectionData: state.setSectionData,
      }))
    );

  return (
    <>
      <FormField stretch={false}>
        <div
          className={
            'flex flex-col basis-2/3 rounded-md ' +
            'border-2 border-dashed border-grey ' +
            'text-slate-700 items-center gap-y-4 py-[48px] ' +
            'transition hover:cursor-pointer hover:bg-grey150'
          }
          onClick={() => {
            setFormSectionModalAction(FormBuilderAction.Add);
            setSectionData(defaultSectionData);
            setIsEditingSection(true);
          }}
        >
          <h1 className={'text-grey m-0 font-normal'}>{'+'}</h1>
          <h1 className={'text-grey m-0 font-semibold'}>{'Add Section'}</h1>
        </div>
      </FormField>
    </>
  );
};
