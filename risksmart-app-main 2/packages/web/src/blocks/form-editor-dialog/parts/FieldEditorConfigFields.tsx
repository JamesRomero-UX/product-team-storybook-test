import { cn } from '@risksmart-app/atomic-ui';
import { useFormContext } from 'react-hook-form';

import { type FieldEditorValues, isOptionFieldType } from '../config';
import { FIELD_TYPE_OPTIONS } from '../constants';
import { FormSelectField, FormTextField } from './FormFields';
import { OptionsEditor } from './OptionsEditor';

export const FieldEditorConfigFields = () => {
  const { watch } = useFormContext<FieldEditorValues>();
  const fieldType = watch('fieldType');
  const showOptions = isOptionFieldType(fieldType);

  return (
    <div className={cn('flex flex-col gap-4')}>
      <FormSelectField
        name={'fieldType'}
        label={'Field type'}
        placeholder={'Select a field type'}
        options={FIELD_TYPE_OPTIONS}
      />
      <FormTextField
        name={'fieldName'}
        label={'Field name'}
        placeholder={'Risk name'}
      />
      {showOptions ? <OptionsEditor /> : null}
    </div>
  );
};
