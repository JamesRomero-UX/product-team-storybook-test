import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import IndicatorsDetailsFormFields from './IndicatorDetailsFormFields';
import type { IndicatorFormDataFields } from './indicatorSchema';
import { defaultValues, indicatorSchema } from './indicatorSchema';

export type Props = Omit<
  FormContextProps<IndicatorFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & { isUpdate?: boolean; latestTestDate?: string | undefined };

const IndicatorDetailsForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={indicatorSchema}
      defaultValues={defaultValues}
      i18n={t('indicators')}
      formId={'indicator-form'}
      parentType={Parent_Type_Enum.Indicator}
    >
      <IndicatorsDetailsFormFields
        readOnly={props.readOnly}
        isUpdate={props.isUpdate}
        latestTestDate={props.latestTestDate}
      />
    </CustomisableForm>
  );
};

export default IndicatorDetailsForm;
