import { Header } from '@risk-smart/themed-cloudscape-components';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { defaultFieldConfigData } from './form-configs/field';
import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import { FormBuilderAction } from './types';

interface FormBuilderAddSectionProps {
  parentId: string;
}

export const FormBuilderAddField: FC<FormBuilderAddSectionProps> = ({
  parentId,
}) => {
  const {
    setFormFieldModalAction,
    setIsEditingField,
    setFieldData,
    setParentId,
  } = useFormBuilderFieldStore(
    useShallow((state) => ({
      setFormFieldModalAction: state.setFormFieldModalAction,
      setIsEditingField: state.setIsEditingField,
      setFieldData: state.setFieldConfigData,
      setParentId: state.setParentId,
    }))
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.formField',
  });

  return (
    <>
      <div
        className={
          'flex w-max p-3 transition hover:cursor-pointer hover:bg-grey150 rounded-md'
        }
        onClick={() => {
          setFormFieldModalAction(FormBuilderAction.Add);
          setParentId(parentId);
          setFieldData(defaultFieldConfigData);
          setIsEditingField(true);
        }}
      >
        <Header variant={'h3'}>{t('addFieldButtonLabel')}</Header>
      </div>
    </>
  );
};
