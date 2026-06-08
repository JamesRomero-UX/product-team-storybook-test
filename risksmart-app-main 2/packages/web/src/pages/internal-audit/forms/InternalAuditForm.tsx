import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import InternalAuditFormFields from './InternalAuditFormFields';
import type { InternalAuditFormDataFields } from './internalAuditSchema';
import { defaultValues, InternalAuditFormSchema } from './internalAuditSchema';

export type Props = Omit<
  FormContextProps<InternalAuditFormDataFields>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

const InternalAuditForm: FC<Props> = (props) => {
  const { user } = useRisksmartUser();
  const { t } = useTranslation(['common']);
  const defaultData: InternalAuditFormDataFields = {
    ...defaultValues,
    Owners: [
      {
        type: 'user',
        value: user!.userId,
      },
    ],
  };

  return (
    <CustomisableForm
      {...props}
      header={t('details')}
      schema={InternalAuditFormSchema}
      defaultValues={defaultData}
      i18n={t('internalAudits')}
      formId={'internal-audit-form'}
      parentType={Parent_Type_Enum.InternalAuditEntity}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    >
      <InternalAuditFormFields readOnly={props.readOnly} />
    </CustomisableForm>
  );
};

export default InternalAuditForm;
