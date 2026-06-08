import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { ControlGroupFormFieldData } from './controlGroupSchema';

interface Props {
  readOnly?: boolean;
}

const ControlGroupFormFields: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<ControlGroupFormFieldData>();

  const { t: st } = useTranslation(['common'], { keyPrefix: 'controlGroups' });
  const { t } = useTranslation(['common']);
  const formConfig = useFormConfig(Parent_Type_Enum.ControlGroup);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={'name'}
        name={formConfig.Title.fieldId}
        forceRequired={true}
        label={formConfig.Title.formLabel}
        control={control}
        disabled={readOnly}
        description={st('fields.Title_help')}
        placeholder={st('fields.Title_placeholder') ?? ''}
      />

      <ControlledTextarea
        key={'description'}
        testId={'description'}
        defaultRequired={true}
        name={formConfig.Description.fieldId}
        label={formConfig.Description.formLabel}
        description={st('fields.Description_help')}
        placeholder={st('fields.Description_placeholder') ?? ''}
        disabled={readOnly}
        control={control}
      />

      <ControlledGroupAndUserSelect
        includeGroups={false}
        forceRequired={true}
        key={'owner'}
        testId={'owner'}
        control={control}
        label={formConfig.Owner.formLabel}
        name={formConfig.Owner.fieldId}
        disabled={readOnly}
        description={st('fields.Owner_help')}
        placeholder={t('searchForAPerson') ?? ''}
      />
    </CustomisableFieldWrapper>
  );
};

export default ControlGroupFormFields;
