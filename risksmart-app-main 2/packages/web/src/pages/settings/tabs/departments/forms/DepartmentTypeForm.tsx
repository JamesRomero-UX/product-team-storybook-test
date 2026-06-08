import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledInput from 'src/components/form/controlled-input';

import type { DepartmentTypeFormFields } from './departmentTypeSchema';

interface Props {
  departmentGroupOptions: {
    value: string;
  }[];
  readOnly?: boolean;
}

const DepartmentTypeForm: FC<Props> = ({
  departmentGroupOptions: departmentGroupOptions,
  readOnly,
}) => {
  const { control } = useFormContext<DepartmentTypeFormFields>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'departments',
  });

  return (
    <>
      <ControlledInput
        key={'name'}
        testId={'name'}
        forceRequired={true}
        name={'Name'}
        label={t('fields.nameField')}
        placeholder={t('fields.placeholders.name')}
        control={control}
        disabled={readOnly}
      />
      <ControlledInput
        key={'description'}
        testId={'description'}
        name={'Description'}
        label={t('fields.descriptionField')}
        placeholder={t('fields.placeholders.description')}
        control={control}
        disabled={readOnly}
      />
      <ControlledAutosuggest
        testId={'departmentGroupName'}
        key={'departmentGroupName'}
        name={'DepartmentGroupName'}
        label={t('fields.groupField')}
        placeholder={t('fields.placeholders.group')}
        control={control}
        options={departmentGroupOptions}
        enableVirtualScroll={true}
        disabled={readOnly}
      />
    </>
  );
};

export default DepartmentTypeForm;
