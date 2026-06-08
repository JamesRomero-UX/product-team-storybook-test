import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import ObligationDetailsFormFields from './ObligationDetailsFormFields';
import type { ObligationFormFieldData } from './obligationSchema';
import { ObligationSchema } from './obligationSchema';

export type Props = Omit<
  FormContextProps<ObligationFormFieldData>,
  'formId' | 'header' | 'i18n' | 'parentType' | 'renderTemplate' | 'schema'
> & {
  obligationId?: string;
  parentObligationNode?: {
    Id: string;
    SequentialId?: null | number | undefined;
    ObjectType: Parent_Type_Enum;
  } | null;
  latestTestDate?: null | string;
  initialType?: ObligationFormFieldData['Type'];
  external?: boolean;
};

const ObligationDetailsForm: FC<Props> = ({ defaultValues, ...props }) => {
  const { t } = useTranslation(['common']);
  const { user } = useRisksmartUser();
  const {
    hasPermission: canInsertStandardObligations,
    loading: canInsertStandardObligationsLoading,
  } = useHasPermissionQuery('insert:obligation');
  const defaultType =
    props.initialType ||
    ((canInsertStandardObligations && !canInsertStandardObligationsLoading) ||
    props.obligationId
      ? 'standard'
      : 'chapter');
  const defaultData: ObligationFormFieldData = {
    ...(defaultValues as ObligationFormFieldData),
    Type: defaultType,
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
      defaultValues={defaultData}
      formId={'obligation-form'}
      i18n={t('obligations')}
      header={t('details')}
      schema={ObligationSchema}
      parentType={Parent_Type_Enum.Obligation}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    >
      <ObligationDetailsFormFields
        readOnly={props.readOnly}
        obligationId={props.obligationId}
        external={props.external}
        parentObligationNode={props.parentObligationNode}
        latestTestDate={props.latestTestDate}
      />
    </CustomisableForm>
  );
};

export default ObligationDetailsForm;
