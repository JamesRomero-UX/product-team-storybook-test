import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { SelectedField } from './fieldSelectionSchema';

export type Props = {
  defaultLabel: string;
  field?: SelectedField;
  onSelectionChange: (checked: boolean) => void;
  onLabelChange: (label: string) => void;
  disabled: boolean;
};

const Field: FC<Props> = ({
  defaultLabel,
  field,
  onSelectionChange,
  onLabelChange,
  disabled,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'customDatasources.fieldSelectionForm.fields',
  });
  const checked = !!field;

  return (
    <li
      data-testid={'field-selection-field'}
      className={
        'list-none p-3 border-0 border-grey150 border-solid border-t-[0.5px]'
      }
    >
      <div className={'flex justify-between items-center min-h-8'}>
        <div data-testid={'field-selection-field-label'}>{defaultLabel}</div>

        <Toggle
          disabled={disabled}
          data-testid={'field-selection-field-toggle'}
          checked={checked}
          onChange={() => onSelectionChange(!field)}
        />
      </div>
      {checked && (
        <div className={'mt-2'}>
          <FormField label={t('label')}>
            <Input
              placeholder={t('labelPlaceholder')}
              disabled={disabled}
              value={field.label ?? ''}
              onChange={(e) => onLabelChange(e.detail.value)}
            />
          </FormField>
        </div>
      )}
    </li>
  );
};

export default Field;
