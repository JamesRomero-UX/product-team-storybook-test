import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledSelect from 'src/components/form/controlled-select';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';

import type { LinkAssessmentFormFields } from './LinkAssessmentFormSchema';

type Props = {
  assessmentOptions: SelectProps.Options;
};

export const LinkAssessmentForm: FC<Props> = ({ assessmentOptions }) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'wizard' });
  const { control } = useFormContext<LinkAssessmentFormFields>();

  return (
    <CustomisableFieldWrapper>
      <ControlledSelect
        key={'assessmentId'}
        defaultRequired={true}
        filteringType={'auto'}
        statusType={'finished'}
        label={t('forms.linkAssessmentLabel')}
        name={'AssessmentId'}
        description={t('forms.linkAssessmentHelp')}
        placeholder={t('forms.linkAssessmentPlaceholder')}
        control={control}
        testId={'assessment'}
        options={assessmentOptions}
      />
    </CustomisableFieldWrapper>
  );
};
