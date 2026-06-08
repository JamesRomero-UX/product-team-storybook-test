import { JsonForms } from '@jsonforms/react';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import { CheckCircle } from '@untitled-ui/icons-react';
import type { ErrorObject } from 'ajv';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import Button from '../button';
import { rendererRegistry } from './renderers/registry';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import { getErrorsForVisibleFields } from './utils';
import { validator } from './validator';

export const FormPreviewModal = () => {
  const [errors, setErrors] = useState<ErrorObject[]>([]);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.previewMode',
  });

  const {
    previewFormData,
    setPreviewFormData,
    schema,
    uiSchema,
    setIsPreviewingForm,
    isFormDirty,
    setIsFormDirty,
  } = useFormBuilderStore(
    useShallow((state) => ({
      previewFormData: state.previewFormData,
      setPreviewFormData: state.setPreviewFormData,
      schema: state.schema,
      uiSchema: state.uiSchema,
      setIsPreviewingForm: state.setIsPreviewingForm,
      isFormDirty: state.isFormDirty,
      setIsFormDirty: state.setIsFormDirty,
    }))
  );

  const onDismiss = () => {
    setIsPreviewingForm(false);
    setIsFormDirty(false);
    setPreviewFormData({});
  };

  return (
    <Modal
      data-testid={'preview-questionnaire-modal'}
      size={'large'}
      visible={true}
      onDismiss={onDismiss}
      header={t('modalHeader')}
      footer={
        <div className={'flex justify-between items-center'}>
          <div className={'flex gap-x-4'}>
            <Button variant={'primary'} onClick={() => setIsFormDirty(true)}>
              {t('validateButton')}
            </Button>
            <Button variant={'normal'} onClick={onDismiss}>
              {t('cancelButtonLabel')}
            </Button>
          </div>
          {isFormDirty ? (
            errors && errors?.length > 0 ? (
              <div className={'text-[#db0000]'}>{'This form has errors'}</div>
            ) : (
              <div className={'text-[#6DAC3F] flex items-center gap-x-2'}>
                <CheckCircle height={18} width={18} />
                <div>{'No errors'}</div>
              </div>
            )
          ) : null}
        </div>
      }
    >
      <JsonForms
        data={previewFormData}
        ajv={validator}
        schema={schema}
        uischema={uiSchema}
        renderers={rendererRegistry}
        onChange={({ data }) => {
          setPreviewFormData(data);
          setErrors(getErrorsForVisibleFields(uiSchema, data));
          setIsFormDirty(false);
        }}
      />
    </Modal>
  );
};
