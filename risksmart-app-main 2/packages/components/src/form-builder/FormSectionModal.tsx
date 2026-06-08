import { JsonForms } from '@jsonforms/react';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import type { ErrorObject } from 'ajv';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import Button from '../button';
import DeleteButton from '../delete-button';
import DeleteModal from '../delete-modal';
import {
  defaultSectionData,
  sectionSchema,
  sectionUISchema,
} from './form-configs/section';
import { rendererRegistry } from './renderers/registry';
import { useFormBuilderSectionStore } from './store/useFormBuilderSectionStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import { FormBuilderAction, JsonFormsValidationMode } from './types';
import { validator } from './validator';

export const FormSectionModal: FC = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [errors, setErrors] = useState<ErrorObject[] | undefined>([]);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.formSection',
  });

  const { isFormCustomisable, setIsFormDirty } = useFormBuilderStore(
    useShallow((state) => ({
      isFormCustomisable: state.isFormCustomisable,
      setIsFormDirty: state.setIsFormDirty,
    }))
  );

  const {
    addNewSection,
    updateSection,
    deleteSection,
    formSectionModalAction,
    isEditingSection,
    setIsEditingSection,
    sectionData,
    setSectionData,
    currentSectionId,
    setCurrentSectionId,
  } = useFormBuilderSectionStore(
    useShallow((state) => ({
      addNewSection: state.addNewSection,
      updateSection: state.updateSection,
      deleteSection: state.deleteSection,
      formSectionModalAction: state.formSectionModalAction,
      isEditingSection: state.isEditingSection,
      setIsEditingSection: state.setIsEditingSection,
      sectionData: state.sectionData,
      setSectionData: state.setSectionData,
      currentSectionId: state.currentSectionId,
      setCurrentSectionId: state.setCurrentSectionId,
    }))
  );

  const resetModal = () => {
    setSectionData(defaultSectionData);
    setIsEditingSection(false);
    setIsFormDirty(false);
    setCurrentSectionId('');
  };

  const handleEditSectionCancel = () => {
    resetModal();
  };

  const handleAddNewSection = () => {
    addNewSection(sectionData);
    resetModal();
  };

  const handleUpdateSection = () => {
    updateSection(sectionData, currentSectionId);
    resetModal();
  };

  const handleSaveSection = () => {
    if (errors?.length) {
      setIsFormDirty(true);

      return;
    }

    if (formSectionModalAction === FormBuilderAction.Add) {
      handleAddNewSection();
    }

    if (formSectionModalAction === FormBuilderAction.Edit) {
      handleUpdateSection();
    }
  };

  const handleDeleteSection = () => {
    deleteSection(currentSectionId);
    resetModal();
  };

  return (
    <>
      {isEditingSection ? (
        <>
          <Modal
            onDismiss={resetModal}
            visible={isEditingSection}
            data-testid={'form-section-modal'}
            header={
              formSectionModalAction === FormBuilderAction.Add
                ? t('addSectionButtonLabel')
                : t('editSectionButtonLabel')
            }
            footer={
              <div className={'flex justify-between'}>
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    variant={'primary'}
                    onClick={handleSaveSection}
                    formAction={'submit'}
                  >
                    {t('saveButtonLabel')}
                  </Button>
                  <Button variant={'normal'} onClick={handleEditSectionCancel}>
                    {t('cancelButtonLabel')}
                  </Button>
                </SpaceBetween>
                {formSectionModalAction === FormBuilderAction.Edit ? (
                  <DeleteButton onClick={() => setIsDeleteModalVisible(true)}>
                    {t('deleteButtonLabel')}
                  </DeleteButton>
                ) : null}
              </div>
            }
          >
            {/*
                Avoid spreading data into Json Forms as it is a
                known anti-pattern that causes infinite render loops
                https://jsonforms.io/faq/#how-can-i-minimize-re-rendering
              */}
            <JsonForms
              ajv={validator}
              data={sectionData}
              readonly={!isFormCustomisable}
              schema={sectionSchema}
              uischema={sectionUISchema}
              renderers={rendererRegistry}
              onChange={({ data, errors }) => {
                const formattedErrors = errors?.map((error) => ({
                  ...error,
                  dataPath: '',
                })) as ErrorObject[] | undefined;

                setErrors(formattedErrors);
                setSectionData(data);
              }}
              validationMode={JsonFormsValidationMode.ValidateAndShow}
            />
          </Modal>
          <DeleteModal
            loading={false}
            isVisible={isDeleteModalVisible}
            onDelete={handleDeleteSection}
            onDismiss={() => setIsDeleteModalVisible(false)}
            header={t('deleteModal.header')}
          >
            <TextContent>
              <p className={'whitespace-pre-wrap'}>{t('deleteModal.body')}</p>
            </TextContent>
          </DeleteModal>
        </>
      ) : null}
    </>
  );
};
