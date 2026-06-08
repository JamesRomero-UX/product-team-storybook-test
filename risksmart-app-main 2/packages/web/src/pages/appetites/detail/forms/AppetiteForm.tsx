import Alert from '@risk-smart/themed-cloudscape-components/alert';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Appetite_Model_Enum,
  Appetite_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import AppetiteFormFields from './AppetiteFormFields';
import type { AppetiteFormFieldsData } from './appetiteSchema';
import { defaultValues, getAppetiteSchema } from './appetiteSchema';

export type Props = Omit<
  FormContextProps<AppetiteFormFieldsData>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  appetiteAggregation: Appetite_Model_Enum;
};

const AppetiteForm: FC<Props> = ({
  onDismiss,
  onSave,
  readOnly,
  values,
  appetiteAggregation,
}) => {
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const { t } = useTranslation(['common'], { keyPrefix: 'appetites' });
  const { t: tt } = useTranslation(['common']);
  const { options: appetiteOptions } = useRating('risk_appetite');

  return (
    <>
      <CustomisableForm
        onSave={onSave}
        defaultValues={{
          ...defaultValues,
          AppetiteType: impactsEnabled
            ? Appetite_Type_Enum.Impact
            : Appetite_Type_Enum.Risk,
          LowerAppetite: appetiteOptions[0].value as number,
          UpperAppetite: appetiteOptions[0].value as number,
        }}
        i18n={tt('appetites')}
        values={values}
        onDismiss={onDismiss}
        schema={getAppetiteSchema()}
        header={tt('details')}
        formId={'appetite-form'}
        readOnly={readOnly}
        parentType={Parent_Type_Enum.Appetite}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      >
        {readOnly &&
          appetiteAggregation === Appetite_Model_Enum.TopDownCascade && (
            <Alert>{t('appetite_cascade_warning')}</Alert>
          )}
        <AppetiteFormFields readOnly={readOnly} />
      </CustomisableForm>
    </>
  );
};

export default AppetiteForm;
