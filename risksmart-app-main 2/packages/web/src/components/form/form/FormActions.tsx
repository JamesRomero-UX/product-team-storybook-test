import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'src/components/delete-button';

import { useRiskSmartForm } from './customisable-form/RiskSmartFormContext';
import styles from './style.module.scss';
import type { CommonProps, SubmitButtonOptions } from './types';
import { ButtonVariant } from './types';

interface ActionsProps<TFieldValues extends FieldValues> extends Pick<
  CommonProps<TFieldValues>,
  'formId' | 'onDismiss' | 'readOnly'
> {
  methods: UseFormReturn<TFieldValues, unknown>;
  submitActions: SubmitButtonOptions[];
  secondaryActions?: SubmitButtonOptions[];
  onDelete?: () => Promise<void>;
  approvalInProgress?: boolean;
  userIsApprover?: boolean;
}

const FormActions = <TFieldValues extends FieldValues>(
  props: ActionsProps<TFieldValues>
) => {
  const {
    methods,
    onDismiss,
    onDelete,
    submitActions,
    secondaryActions,
    readOnly = false,
  } = props;
  const { t } = useTranslation(['common']);
  const { editMode, toggleEditMode, onSave } = useRiskSmartForm();
  const [savingFormConfig, setSavingFormConfig] = useState(false);

  return (
    <div className={'flex justify-between items-center'}>
      <SpaceBetween direction={'horizontal'} size={'xs'}>
        {editMode && (
          <Button
            disabled={methods.formState.isSubmitting}
            formAction={'none'}
            variant={'primary'}
            loading={savingFormConfig}
            onClick={async () => {
              setSavingFormConfig(true);
              await onSave?.();
              setSavingFormConfig(false);
              toggleEditMode();
            }}
          >
            {'Save form configuration'}
          </Button>
        )}

        {!editMode &&
          !readOnly &&
          submitActions.map(
            ({
              label,
              action,
              variant = ButtonVariant.Standard,
              loading,
              disabled,
            }) => {
              // todo: support extra variant btn style.
              return (
                <Button
                  key={label}
                  loading={loading}
                  {...{
                    className:
                      variant === ButtonVariant.Danger
                        ? styles.dangerButton
                        : '',
                  }}
                  disabled={methods.formState.isSubmitting || disabled}
                  variant={'primary'}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    action();
                  }}
                >
                  {label}
                </Button>
              );
            }
          )}
        <Button
          disabled={methods.formState.isSubmitting}
          formAction={'none'}
          variant={'normal'}
          onClick={() => (editMode ? toggleEditMode() : onDismiss?.(false))}
        >
          {t('cancel')}
        </Button>
      </SpaceBetween>

      <SpaceBetween size={'xs'} direction={'horizontal'}>
        {onDelete ? (
          <DeleteButton onClick={onDelete}>{t('delete')}</DeleteButton>
        ) : null}

        {!editMode &&
          !readOnly &&
          secondaryActions &&
          secondaryActions.map(
            ({ label, action, variant = ButtonVariant.Standard, loading }) => {
              // todo: support extra variant btn style.
              return (
                <Button
                  key={label}
                  loading={loading}
                  {...{
                    className:
                      variant === ButtonVariant.Danger
                        ? styles.dangerButton
                        : '',
                  }}
                  disabled={methods.formState.isSubmitting}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    action();
                  }}
                >
                  {label}
                </Button>
              );
            }
          )}
      </SpaceBetween>
    </div>
  );
};

export default FormActions;
