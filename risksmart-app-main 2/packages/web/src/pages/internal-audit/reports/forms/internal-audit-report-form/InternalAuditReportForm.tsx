import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import InternalAuditReportFormFields from './InternalAuditReportFormFields';
import type { InternalAuditReportFormDataFields } from './internalAuditReportSchema';
import {
  defaultValues,
  InternalAuditReportFormSchema,
} from './internalAuditReportSchema';

type Props = Omit<
  FormContextProps<InternalAuditReportFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  initialTier?: number;
  riskId?: string;
  disabledUsers?: { userId: string; reason: string }[];
};

const InternalAuditReportForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);
  const { user } = useRisksmartUser();
  const { t: ts } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });
  const defaultData: InternalAuditReportFormDataFields = {
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
      schema={InternalAuditReportFormSchema}
      defaultValues={defaultData}
      i18n={{ entity_name: ts('entity_name') }}
      formId={'internal-audit-report-form'}
      parentType={Parent_Type_Enum.InternalAuditReport}
      renderTemplate={props.renderTemplate}
    >
      <InternalAuditReportFormFields
        readOnly={props.readOnly}
        disabledUsers={props.disabledUsers}
      />
    </CustomisableForm>
  );
};

export default InternalAuditReportForm;
