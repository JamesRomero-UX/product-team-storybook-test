import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import RiskFormFields from './RiskFormFields';
import type { RiskFormDataFields } from './riskSchema';
import {
  defaultValues,
  EnterpriseRiskFormSchema,
  RiskFormSchema,
} from './riskSchema';

export type Props = Omit<
  FormContextProps<RiskFormDataFields>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'mapPreviewedChanges'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  initialTier?: number;
  riskId?: string;
  parentRiskNode?: {
    Id: string;
    SequentialId?: null | number | undefined;
    ObjectType: Parent_Type_Enum;
  } | null;
  latestTestDate?: string | undefined;
  enterpriseRisk?: boolean;
};

const RiskForm: FC<Props> = (props) => {
  const { user } = useRisksmartUser();
  const { hasPermission: canInsertTier1Risks, loading: canInsertTier1Loading } =
    useHasPermissionQuery('insert:risk_tier_1');
  const defaultTier =
    props.initialTier ||
    ((canInsertTier1Risks && !canInsertTier1Loading) || props.riskId ? 1 : 2);
  const { t } = useTranslation(['common']);
  const defaultData: RiskFormDataFields = {
    ...defaultValues,
    Tier: defaultTier as RiskFormDataFields['Tier'],
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
      schema={props.enterpriseRisk ? EnterpriseRiskFormSchema : RiskFormSchema}
      defaultValues={defaultData}
      i18n={props.enterpriseRisk ? t('enterpriseRisks') : t('risks')}
      formId={'risk-form'}
      parentType={Parent_Type_Enum.Risk}
      renderTemplate={(renderProps) => (
        <PageWrapper {...renderProps} testId={'risk-form'} />
      )}
      approvalConfig={{ object: { Id: props.riskId ?? '' } }}
      mapPreviewedChanges={(
        current: RiskFormDataFields | undefined,
        incoming: RiskFormDataFields & {
          Owners: { UserId: string }[];
          OwnerGroups: { UserGroupId: string }[];
          Contributors: { UserId: string }[];
          ContributorGroups: { UserGroupId: string }[];
        }
      ): RiskFormDataFields => {
        return {
          ...defaultValues,
          ...current,
          ...incoming,
          Owners: incoming
            ? getOwners({
                owners: incoming.Owners,
                ownerGroups: incoming.OwnerGroups,
              })
            : (current?.Owners ?? []),
          Contributors: incoming
            ? getContributors({
                contributors: incoming.Contributors,
                contributorGroups: incoming.ContributorGroups,
              })
            : (current?.Contributors ?? []),
        };
      }}
    >
      <RiskFormFields
        readOnly={props.readOnly}
        riskId={props.riskId}
        parentRiskNode={props.parentRiskNode}
        latestTestDate={props.latestTestDate}
        enterpriseRisk={props.enterpriseRisk}
      />
    </CustomisableForm>
  );
};

export default RiskForm;
