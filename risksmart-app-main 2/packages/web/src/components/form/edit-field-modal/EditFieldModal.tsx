import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { FormFieldOption } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';

import { useGetFormConfigurationByParentType } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import {
  useDeleteFormField,
  useInsertFormField,
  useUpdateFormField,
} from '../../../hooks/mutations/form-field';
import type { FieldFormFields } from '../custom-attributes/edit-fields/fieldSchema';
import {
  defaultValues,
  getFieldSchema,
} from '../custom-attributes/edit-fields/fieldSchema';
import { useFieldConfig } from '../form/customisable-form/hooks/useFieldConfig';
import { useCustomisableFormDataContext } from '../form/customisable-form-data/CustomisableFormDataContext';
import { FormContext } from '../form/FormContext';
import { ModalWrapper } from '../form/ModalWrapper';
import { EditFieldFields } from './EditFieldFields';
import type { EditFieldModalProps } from './EditFieldModalProps';
import { EditMode } from './types';

export const EditFieldModal: FC<EditFieldModalProps> = ({
  onDismiss,
  parentType,
  values,
  fieldPath,
  editMode = EditMode.Create,
  fieldId,
  defaultRequired,
  forceRequired,
  defaultValueOptions,
  allowDefaultValue,
}) => {
  const isCustomField = !values || values.IsCustomField;
  const { t } = useTranslation(['common']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use the new hooks that support tRPC
  const { insertFormField } = useInsertFormField();
  const { updateFormField, loading: updateLoading } = useUpdateFormField();
  const { deleteFormField } = useDeleteFormField();

  const { formFieldConfigurations } = useCustomisableFormDataContext();

  const { data, loading } = useGetFormConfigurationByParentType({
    queryArgs: { parentTypes: [parentType as unknown as ParentType] },
  });

  const fieldOptionsData = useFieldConfig(fieldId, {
    defaultRequired: defaultRequired,
  });
  const customAttributeSchemaData =
    data?.form_configuration?.[0]?.customAttributeSchema;
  const schemaId = customAttributeSchemaData?.Id;

  const onDelete = useDeleteResultNotification({
    entityName: t('customAttributes.entity_name'),
    asyncAction: async () => {
      if (!values || !schemaId || !fieldId) {
        return false;
      }

      await deleteFormField({
        ParentType: parentType,
        FieldId: fieldId,
      });

      onDismiss();

      return true;
    },
  });

  const mapOptionsFromCustomFields = (
    data: FieldFormFields
  ): FormFieldOption[] => {
    if (!data.IsCustomField) {
      return [];
    }

    if (data.CustomFieldShowAltValues) {
      // if show alt values is set then our zod schema enforces that each option has a key and a value.
      return (
        data.CustomFieldOptions?.map((o) => ({
          _tag: 'AltValueOption',
          Value: o.Value,
          AltValue: !o.AltValue ? undefined : o.AltValue,
        })) ?? []
      );
    } else {
      return (
        data.CustomFieldOptions?.map((o) => ({
          _tag: 'StringOption',
          Value: o.Value,
        })) ?? []
      );
    }
  };

  const onSave = async (data: FieldFormFields) => {
    const options = mapOptionsFromCustomFields(data);

    if (fieldId) {
      const label = data.EnableCustomLabel
        ? data.IsCustomField
          ? data.CustomFieldLabel
          : data.Label
        : null;

      await updateFormField({
        DefaultValue: data.DefaultValue,
        Description: data.Description,
        FieldId: fieldId,
        Hidden: data.Hidden,
        Label: label && label.length > 0 ? label : null,
        AltLabel: data.IsCustomField ? data.CustomFieldAltLabel : undefined,
        IsCustomField: isCustomField,
        Options: options,
        ParentType: parentType,
        ReadOnly: data.ReadOnly,
        Required: data.Required,
        Conditions: data.Conditions,
      });
    } else {
      if (!data.IsCustomField) {
        throw new Error('Cannot create new standard fields');
      }

      await insertFormField({
        Type: data.CustomFieldType,
        IsCustomField: true,
        DefaultValue: data.DefaultValue,
        Description: data.Description,
        Hidden: data.Hidden,
        Label: data.CustomFieldLabel,
        AltLabel: data.CustomFieldAltLabel,
        Options: options,
        ParentType: parentType,
        ReadOnly: data.ReadOnly,
        Required: data.Required,
        Conditions: data.Conditions,
      });
    }
  };

  if (loading || !editMode) {
    return null;
  }

  return (
    <FormContext
      testId={'editFieldModal'}
      i18n={t('customAttributes')}
      defaultValues={{
        ...defaultValues,
        ...fieldOptionsData,
        Label: fieldOptionsData?.Label || '',
        ...(forceRequired ? { Required: true } : {}),
        IsCustomField: isCustomField,
      }}
      values={values}
      schema={getFieldSchema(fieldId ?? '', formFieldConfigurations ?? [])}
      onSave={onSave}
      onDismiss={onDismiss}
      onDelete={
        !!values && !!fieldPath
          ? async () => setShowDeleteModal(true)
          : undefined
      }
      formId={'field-configuration-form'}
      renderTemplate={(renderProps) => (
        <ModalWrapper visible={true} {...renderProps} />
      )}
    >
      <EditFieldFields
        formId={parentType}
        fieldId={fieldId}
        editMode={editMode}
        defaultValueOptions={defaultValueOptions}
        forceRequired={!!forceRequired}
        allowDefaultValue={!!allowDefaultValue}
        isCustomField={isCustomField}
      />

      <DeleteModal
        loading={updateLoading}
        isVisible={showDeleteModal}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={onDismiss}
      >
        {t('customAttributes.confirm_delete_message')}
      </DeleteModal>
    </FormContext>
  );
};
