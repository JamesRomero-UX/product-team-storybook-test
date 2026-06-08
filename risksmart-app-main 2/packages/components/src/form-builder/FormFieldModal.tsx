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
import { getEnv } from '../utils/environment';
import { fieldUISchema, useFieldSchema } from './form-configs/field';
import { rendererRegistry } from './renderers/registry';
import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import type { FieldConfigData } from './types';
import { FormBuilderAction } from './types';
import { isOptionsField, validateConditionalList } from './utils';
import { validator } from './validator';

// JsonForms compatible ErrorObject interface that includes both dataPath (AJV v6) and instancePath (AJV v8+)
interface JsonFormsErrorObject extends ErrorObject {
  dataPath: string;
}

// Legacy AJV ErrorObject interface for v6 compatibility
interface LegacyErrorObject extends ErrorObject {
  dataPath?: string;
}

// Helper function to convert ErrorObject to format expected by JsonForms
// JsonForms expects ErrorObject with dataPath property (AJV v6 format)
// but newer AJV versions use instancePath instead
const convertToJsonFormsErrorFormat = (
  errors: ErrorObject[]
): JsonFormsErrorObject[] => {
  return errors.map((error) => ({
    ...error,
    dataPath: error.instancePath || (error as LegacyErrorObject).dataPath || '', // Add dataPath for JsonForms compatibility
  }));
};

export const FormFieldModal: FC = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [errors, setErrors] = useState<ErrorObject[] | undefined>(undefined);
  const [additionalErrors, setAdditionalErrors] = useState<ErrorObject[]>([]);
  const isLocal = getEnv('REACT_APP_ENVIRONMENT') === 'dev-local';

  const fieldSchema = useFieldSchema();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.formField',
  });

  const { isFormCustomisable, isFormDirty, setIsFormDirty, schema } =
    useFormBuilderStore(
      useShallow((state) => ({
        isFormCustomisable: state.isFormCustomisable,
        isFormDirty: state.isFormDirty,
        setIsFormDirty: state.setIsFormDirty,
        schema: state.schema,
      }))
    );

  const {
    addNewField,
    updateField,
    deleteField,
    formFieldModalAction,
    isEditingField,
    setIsEditingField,
    parentId,
    fieldConfigData,
    setFieldConfigData,
    currentFieldId,
    setCurrentFieldId,
  } = useFormBuilderFieldStore(
    useShallow((state) => ({
      addNewField: state.addNewField,
      updateField: state.updateField,
      deleteField: state.deleteField,
      formFieldModalAction: state.formFieldModalAction,
      isEditingField: state.isEditingField,
      setIsEditingField: state.setIsEditingField,
      parentId: state.parentId,
      fieldConfigData: state.fieldConfigData,
      setFieldConfigData: state.setFieldConfigData,
      currentFieldId: state.currentFieldId,
      setCurrentFieldId: state.setCurrentFieldId,
    }))
  );

  const resetModal = () => {
    setAdditionalErrors([]);
    setIsEditingField(false);
    setIsFormDirty(false);
    setCurrentFieldId('');
  };

  const handleIsFormDirty = () => {
    if (!errors?.length && !additionalErrors?.length && isFormDirty) {
      setIsFormDirty(false);
    }
  };

  const handleEditFieldCancel = () => {
    resetModal();
  };

  const handleAddNewField = (fieldConfigData: FieldConfigData) => {
    addNewField(fieldConfigData, parentId);
    resetModal();
  };

  const handleAdditionalErrors = (fieldConfigData: FieldConfigData) => {
    const { conditionalOptions, isConditional, selectOptions, fieldType } =
      fieldConfigData;

    setAdditionalErrors([]);

    const safeSelectOptions = selectOptions || [];
    const conditionalOptionTokens = conditionalOptions?.tokens || [];
    const conditionalListErrors = validateConditionalList(
      fieldConfigData,
      schema,
      currentFieldId
    );

    if (conditionalListErrors.length > 0) {
      setAdditionalErrors([conditionalListErrors[0]]);
    }

    if (isOptionsField(fieldType)) {
      if ((safeSelectOptions ?? []).length > 1) {
        const selectOptionTitles = safeSelectOptions.map(
          (option) => option.value
        );
        const selectOptionTitleSet = new Set(selectOptionTitles);
        const hasDuplicateTitle =
          selectOptionTitles.length !== selectOptionTitleSet.size;

        if (hasDuplicateTitle) {
          const newError: ErrorObject = {
            instancePath: '/selectOptions',
            message:
              'All options must be unique. Remove any duplicates and try again.',
            schemaPath: '',
            keyword: '',
            params: {},
          };

          setAdditionalErrors([newError]);
        }
      }
    }

    if (isConditional && conditionalOptionTokens.length > 1) {
      const propertyKeys = conditionalOptionTokens.map(
        (option: { propertyKey?: string }) => option.propertyKey
      );

      const propertyKeySet = new Set(propertyKeys);
      const hasDuplicatePropertyKey =
        propertyKeys.length !== propertyKeySet.size;

      if (hasDuplicatePropertyKey) {
        const newError: ErrorObject = {
          instancePath: '/conditionalOptions',
          message:
            'One or more options have been added multiple times. Remove any duplicates and try again.',
          schemaPath: '',
          keyword: '',
          params: {},
        };

        setAdditionalErrors([newError]);
      }
    }

    handleIsFormDirty();
  };

  const handleUpdateField = (fieldConfigData: FieldConfigData) => {
    updateField(fieldConfigData, currentFieldId, parentId);
    resetModal();
  };

  const handleSaveField = (fieldConfigData: FieldConfigData) => {
    handleAdditionalErrors(fieldConfigData);

    if (errors?.length || additionalErrors?.length) {
      setIsFormDirty(true);

      return;
    }

    if (formFieldModalAction === FormBuilderAction.Add) {
      handleAddNewField(fieldConfigData);
    }

    if (formFieldModalAction === FormBuilderAction.Edit) {
      handleUpdateField(fieldConfigData);
    }
  };

  const handleDeleteField = () => {
    deleteField(currentFieldId, parentId);
    resetModal();
  };

  return (
    <>
      {isEditingField ? (
        <>
          <Modal
            data-testid={'form-field-modal'}
            onDismiss={resetModal}
            visible={isEditingField}
            header={
              formFieldModalAction === FormBuilderAction.Add
                ? t('addFieldModalTitle')
                : t('editFieldModalTitle')
            }
            footer={
              <div className={'flex justify-between'}>
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    variant={'primary'}
                    onClick={() => handleSaveField(fieldConfigData)}
                  >
                    {t('saveButtonLabel')}
                  </Button>
                  <Button variant={'normal'} onClick={handleEditFieldCancel}>
                    {t('cancelButtonLabel')}
                  </Button>
                  {isLocal ? (
                    // Leaving this here for local testing
                    <Button
                      variant={'normal'}
                      onClick={() => console.log({ errors, additionalErrors })}
                    >
                      {'Log Errors'}
                    </Button>
                  ) : null}
                </SpaceBetween>
                {formFieldModalAction === FormBuilderAction.Edit ? (
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
              data={fieldConfigData}
              readonly={!isFormCustomisable}
              schema={fieldSchema}
              uischema={fieldUISchema}
              renderers={rendererRegistry}
              additionalErrors={convertToJsonFormsErrorFormat(additionalErrors)}
              onChange={({ data, errors }) => {
                setFieldConfigData(data);
                setErrors(errors);
                setIsFormDirty(false);
                handleAdditionalErrors(data);
              }}
            />
          </Modal>

          <DeleteModal
            loading={false}
            isVisible={isDeleteModalVisible}
            onDelete={handleDeleteField}
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
