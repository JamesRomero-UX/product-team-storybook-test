import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import { ThirdPartyFormFields } from './ThirdPartyFormFields';
import type { ThirdPartyFormData } from './thirdPartySchema';
import { defaultValues, thirdPartyFormSchema } from './thirdPartySchema';

export type Props = Omit<
  FormContextProps<ThirdPartyFormData>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'mapPreviewedChanges'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

export const ThirdPartyForm = ({ ...props }: Props) => {
  const { t } = useTranslation();

  return (
    <CustomisableForm
      {...props}
      values={props.values}
      formId={'third-party-form'}
      defaultValues={defaultValues}
      i18n={t('third_party')}
      header={t('details')}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      parentType={Parent_Type_Enum.ThirdParty}
      schema={thirdPartyFormSchema}
    >
      <ThirdPartyFormFields />
    </CustomisableForm>
  );
};
