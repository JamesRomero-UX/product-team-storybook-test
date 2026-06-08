import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button/Button';
import Modal from '@risksmart-app/components/src/modal';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Define the form values type
type Orientation = 'landscape' | 'portrait';
export type CustomPdfFormValues = {
  title: string;
  subtitle: string;
  hideRibbon: boolean;
  orientation: Orientation;
};

interface CustomPdfExportModalProps {
  exportToPdf: (options: CustomPdfFormValues) => Promise<void>;
  entityLabel?: string;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  showRibbonOptions?: boolean;
}

const CustomPdfExportModal = ({
  exportToPdf,
  entityLabel,
  showModal,
  setShowModal,
  showRibbonOptions,
}: CustomPdfExportModalProps) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'export' });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CustomPdfFormValues>({
    defaultValues: {
      title: entityLabel || '',
      subtitle: '',
      hideRibbon: false,
      orientation: 'landscape',
    },
  });

  const resetForm = useCallback(() => {
    reset({
      title: entityLabel || '',
      subtitle: '',
      hideRibbon: false,
      orientation: 'landscape',
    });
  }, [entityLabel, reset]);

  const onSubmit = handleSubmit(
    async ({ title, subtitle, hideRibbon, orientation }) => {
      // Close immediately, then trigger export with overrides
      setShowModal(false);
      resetForm();
      await exportToPdf({
        title,
        subtitle,
        hideRibbon,
        orientation,
      });
    }
  );

  return (
    <Modal
      key={'custom-pdf-modal'} // Add a key for React list rendering
      visible={showModal}
      onDismiss={() => {
        setShowModal(false);
        resetForm();
      }}
      header={t('custom_pdf_header')}
      footer={
        <SpaceBetween direction={'horizontal'} size={'xs'} alignItems={'end'}>
          <Button
            variant={'primary'}
            disabled={isSubmitting}
            onClick={() => {
              void onSubmit();
            }}
          >
            {t('export')}
          </Button>
          <Button onClick={() => setShowModal(false)}>{t('cancel')}</Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction={'vertical'} size={'s'}>
        <FormField label={t('custom_pdf_title_label')} stretch>
          <Controller
            name={'title'}
            control={control}
            render={({ field }) => (
              <Input
                placeholder={t('custom_pdf_title_placeholder')}
                value={field.value}
                onChange={(e) => field.onChange(e.detail.value)}
              />
            )}
          />
        </FormField>
        <FormField label={t('custom_pdf_subtitle_label')} stretch>
          <Controller
            name={'subtitle'}
            control={control}
            render={({ field }) => (
              <Input
                placeholder={t('custom_pdf_subtitle_placeholder')}
                value={field.value}
                onChange={(e) => field.onChange(e.detail.value)}
              />
            )}
          />
        </FormField>
        <FormField label={t('custom_pdf_orientation_label')} stretch>
          <Controller
            name={'orientation'}
            control={control}
            render={({ field }) => (
              <RadioGroup
                items={[
                  {
                    value: 'landscape',
                    label: t('orientation.landscape'),
                  },
                  {
                    value: 'portrait',
                    label: t('orientation.portrait'),
                  },
                ]}
                value={field.value}
                onChange={(e) => field.onChange(e.detail.value as Orientation)}
              />
            )}
          />
        </FormField>
        {showRibbonOptions && (
          <Controller
            name={'hideRibbon'}
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.detail.checked)}
              >
                {t('custom_pdf_hide_ribbon')}
              </Checkbox>
            )}
          />
        )}
      </SpaceBetween>
    </Modal>
  );
};

export default CustomPdfExportModal;
