import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import AcceptanceFormFields from './AcceptanceFormFields';
import type { AcceptanceFormDataFields } from './acceptanceSchema';
import { AcceptanceSchema, defaultValues } from './acceptanceSchema';

export type Props = Omit<
  FormContextProps<AcceptanceFormDataFields>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

const AcceptanceForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      i18n={t('acceptances')}
      schema={AcceptanceSchema}
      formId={'acceptance-form'}
      defaultValues={defaultValues}
      parentType={Parent_Type_Enum.Acceptance}
      header={t('details')}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    >
      <AcceptanceFormFields />
    </CustomisableForm>
  );
};

export default AcceptanceForm;
