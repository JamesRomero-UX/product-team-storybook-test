import { JsonForms } from '@jsonforms/react';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Form from '@risk-smart/themed-cloudscape-components/form';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC, FormEvent, FormEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import Button from '../button';
import { useNotifications } from '../notifications/useNotifications';
import { rendererRegistry } from './renderers/registry';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import type { CustomSchema, CustomUISchema, ResponseData } from './types';
import { JsonFormsValidationMode } from './types';
import { CustomFormSubmitType } from './types';
import {
  getErrorsForVisibleFields,
  getResponseDataExcludingDataForHiddenFields,
} from './utils';
import { validator } from './validator';

interface Props {
  readOnly?: boolean;
  onCancel: () => void;
  onSubmit: (data: ResponseData) => Promise<void>;
  onSave: (data: ResponseData) => Promise<void>;
  values: ResponseData;
  schema: CustomSchema;
  uischema: CustomUISchema;
  notificationI18n: {
    saveSuccess: string;
    submitSuccess: string;
    submitError: string;
  };
}

export const CustomForm: FC<Props> = ({
  readOnly,
  onCancel,
  onSubmit,
  onSave,
  values,
  schema,
  uischema,
  notificationI18n,
}) => {
  const [data, setData] = useState<ResponseData>(values);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customForms',
  });

  const [submitType, setSubmitType] = useState<CustomFormSubmitType>(
    CustomFormSubmitType.None
  );

  const { addNotification } = useNotifications();
  const { setIsFormDirty, setSchema } = useFormBuilderStore(
    useShallow((state) => ({
      setIsFormDirty: state.setIsFormDirty,
      setSchema: state.setSchema,
    }))
  );

  // Initialize the store's schema when component mounts,
  // otherwise getErrorsForVisibleFields will use the store's default empty schema
  // and validation will not work as expected (e.g. always pass even when mandatory fields are missing)
  // TODO: Find route cause of why isValid is always true in getErrorsForVisibleFields
  useEffect(() => {
    setSchema(schema);
  }, [schema, setSchema]);

  const onSaveFn = async () => {
    setIsSubmitting(true);
    setIsFormDirty(true);
    // Remove data for hidden fields before saving
    const cleanedData = getResponseDataExcludingDataForHiddenFields(
      uischema,
      data
    );

    await onSave(cleanedData);

    addNotification({
      type: 'success',
      content: notificationI18n.saveSuccess,
    });

    setIsSubmitting(false);
  };

  const onSubmitFn: FormEventHandler<HTMLFormElement> = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsFormDirty(true);
    // Remove data for hidden fields before saving
    const cleanedData = getResponseDataExcludingDataForHiddenFields(
      uischema,
      data
    );

    // Validate at submit time to catch all errors, including fields user hasn't interacted with
    const validationErrors = getErrorsForVisibleFields(uischema, data);

    if (validationErrors.length > 0) {
      addNotification({
        type: 'error',
        content: notificationI18n.submitError,
      });

      setIsSubmitting(false);

      return;
    }

    await onSubmit(cleanedData);

    addNotification({
      type: 'success',
      content: notificationI18n.submitSuccess,
    });

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={onSubmitFn}>
      <Container>
        <Form
          actions={<></>}
          secondaryActions={
            <SpaceBetween
              size={'xs'}
              direction={'horizontal'}
              alignItems={'start'}
            >
              {readOnly ? (
                <></>
              ) : (
                <>
                  <Button
                    variant={'primary'}
                    formAction={'submit'}
                    disabled={isSubmitting}
                    onClick={() => setSubmitType(CustomFormSubmitType.Submit)}
                  >
                    {t('submit_button_label')}
                  </Button>
                  <Button
                    disabled={isSubmitting}
                    formAction={'none'}
                    onClick={() => {
                      setSubmitType(CustomFormSubmitType.Draft);
                      onSaveFn();
                    }}
                  >
                    {t('save_button_label')}
                  </Button>
                </>
              )}
              <Button
                variant={'normal'}
                disabled={isSubmitting}
                formAction={'none'}
                onClick={onCancel}
              >
                {readOnly ? t('back_button_label') : t('cancel_button_label')}
              </Button>
            </SpaceBetween>
          }
        >
          <JsonForms
            ajv={validator}
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={rendererRegistry}
            readonly={readOnly}
            onChange={({ data }) => {
              setData(data);
            }}
            validationMode={
              submitType === CustomFormSubmitType.Submit
                ? JsonFormsValidationMode.ValidateAndShow
                : JsonFormsValidationMode.ValidateAndHide
            }
          />
        </Form>
      </Container>
    </form>
  );
};
