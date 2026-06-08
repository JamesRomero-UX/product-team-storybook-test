import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  GetAcceptancesDocument,
  GetActionsDocument,
  GetAppetitesDocument,
  GetAssessmentsDocument,
  GetControlGroupsDocument,
  GetControlsDocument,
  GetImpactListDocument,
  GetIndicatorsDocument,
  GetIssuesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledRiskMultiSelect from 'src/components/form/controlled-risk-multi-select';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTypedMultiselect from 'src/components/form/controlled-typed-multiselect';
import type {
  ControlledTypeMultipleSelectProps,
  DataItem,
} from 'src/components/form/controlled-typed-multiselect/ControlledTypedMultiselect';
import type { LinkedItemFields } from 'src/schemas/linkedItemSchema';

import { useEntityInfo } from '@/hooks/getEntityInfo';
import {
  useGetObligationChangesRegister,
  useGetObligationsRegister,
  useGetPolicyRegister,
  useGetThirdPartyRegister,
} from '@/hooks/queries';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

interface Props {
  excludeIds: string[];
  includeAssessments?: boolean;
  restrictTypeTo?: Parent_Type_Enum;
}

const LinkedItemForm: FC<Props> = ({
  excludeIds,
  includeAssessments,
  restrictTypeTo,
}) => {
  const { control, watch } = useFormContext<LinkedItemFields>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'linkedItems.fields',
  });
  const linkType: Parent_Type_Enum = watch('Type');
  const hasAppetiteLinks = useIsFeatureFlagEnabled('appetite_links');
  const hasThirdParties = useIsModuleEnabled('third_party');
  const hasGoldenCharterIssues = useIsFeatureFlagEnabled('issue-gc');
  const hasAllicaIssues = useIsFeatureFlagEnabled('issue-allica');
  const hasObligationChanges = useIsModuleEnabled(
    'obligation.subModules.reg_feed'
  );
  const getEntityInfo = useEntityInfo();
  const { data: acceptanceData, loading: loadingAcceptances } = useQuery(
    GetAcceptancesDocument,
    { skip: linkType !== Parent_Type_Enum.Acceptance }
  );
  const { data: actionData, loading: loadingActions } = useQuery(
    GetActionsDocument,
    {
      skip: linkType !== Parent_Type_Enum.Action,
    }
  );
  const { data: appetiteData, loading: loadingAppetites } = useQuery(
    GetAppetitesDocument,
    {
      skip: linkType !== Parent_Type_Enum.Appetite,
    }
  );
  const { data: assessmentData, loading: loadingAssessments } = useQuery(
    GetAssessmentsDocument,
    {
      skip: linkType !== Parent_Type_Enum.Assessment,
    }
  );
  const { data: indicatorData, loading: loadingIndicators } = useQuery(
    GetIndicatorsDocument,
    {
      skip: linkType !== Parent_Type_Enum.Indicator,
    }
  );
  const { data: impactData, loading: loadingImpacts } = useQuery(
    GetImpactListDocument,
    {
      skip: linkType !== Parent_Type_Enum.Impact,
    }
  );
  const { data: controlData, loading: loadingControls } = useQuery(
    GetControlsDocument,
    {
      skip: linkType !== Parent_Type_Enum.Control,
    }
  );
  const { data: controlGroupData, loading: loadingControlGroups } = useQuery(
    GetControlGroupsDocument,
    {
      skip: linkType !== Parent_Type_Enum.ControlGroup,
    }
  );

  const { data: documentData, loading: loadingDocuments } =
    useGetPolicyRegister({
      queryArgs: {},
      shouldSkip: linkType !== Parent_Type_Enum.Document,
    });

  const { data: obligationData, loading: loadingObligation } =
    useGetObligationsRegister({
      queryArgs: {},
      shouldSkip: linkType !== Parent_Type_Enum.Obligation,
    });
  const { data: obligationChangeData, loading: loadingObligationChanges } =
    useGetObligationChangesRegister({
      queryArgs: {},
      shouldSkip: linkType !== Parent_Type_Enum.ObligationChange,
    });
  const { data: issueData, loading: loadingIssues } = useQuery(
    GetIssuesDocument,
    {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.Issue,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.Issue,
    }
  );
  const { data: issueRiskEventData, loading: loadingIssueRiskEvents } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueRiskEvent,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueRiskEvent,
    });
  const { data: issueBreachLogData, loading: loadingIssueBreachLogs } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueBreachLog,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueBreachLog,
    });
  const { data: issueConsumerDutyData, loading: loadingIssueConsumerDuty } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueConsumerDuty,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueConsumerDuty,
    });
  const { data: issueCustomerTrustData, loading: loadingIssueCustomerTrust } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueCustomerTrust,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueCustomerTrust,
    });
  const { data: issueGDPRBreachLogData, loading: loadingIssueGDPRBreachLog } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueGdprBreachLog,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueGdprBreachLog,
    });
  const { data: issuePCIBreachLogData, loading: loadingIssuePCIBreachLog } =
    useQuery(GetIssuesDocument, {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssuePciBreachLog,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssuePciBreachLog,
    });
  const { data: issueSARLogData, loading: loadingIssueSARLog } = useQuery(
    GetIssuesDocument,
    {
      variables: {
        where: {
          Type: {
            _eq: Parent_Type_Enum.IssueSarLog,
          },
        },
      },
      skip: linkType !== Parent_Type_Enum.IssueSarLog,
    }
  );

  const { data: thirdPartyData, loading: loadingThirdParties } =
    useGetThirdPartyRegister({
      queryArgs: {},
      shouldSkip: linkType !== Parent_Type_Enum.ThirdParty,
    });

  const typeOptions = useMemo<SelectProps.Options>(() => {
    const types: Parent_Type_Enum[] = [
      ...(includeAssessments ? [Parent_Type_Enum.Assessment] : []),
      Parent_Type_Enum.Acceptance,
      Parent_Type_Enum.Action,
      ...(hasAppetiteLinks ? [Parent_Type_Enum.Appetite] : []),
      Parent_Type_Enum.Control,
      Parent_Type_Enum.ControlGroup,
      Parent_Type_Enum.Document,
      Parent_Type_Enum.Indicator,
      Parent_Type_Enum.Issue,
      ...(hasAllicaIssues ? [Parent_Type_Enum.IssueRiskEvent] : []),
      ...(hasGoldenCharterIssues
        ? [
            Parent_Type_Enum.IssueBreachLog,
            Parent_Type_Enum.IssueConsumerDuty,
            Parent_Type_Enum.IssueCustomerTrust,
            Parent_Type_Enum.IssueGdprBreachLog,
            Parent_Type_Enum.IssuePciBreachLog,
            Parent_Type_Enum.IssueSarLog,
          ]
        : []),
      Parent_Type_Enum.Obligation,
      ...(hasObligationChanges ? [Parent_Type_Enum.ObligationChange] : []),
      Parent_Type_Enum.Risk,
      ...(hasThirdParties ? [Parent_Type_Enum.ThirdParty] : []),
    ];

    return types
      .filter((type) => restrictTypeTo === undefined || type === restrictTypeTo)
      .map((type) => ({
        value: type,
        label: i18n.format(getEntityInfo(type).singular, 'capitalize'),
      }));
  }, [
    getEntityInfo,
    hasAppetiteLinks,
    hasThirdParties,
    includeAssessments,
    hasAllicaIssues,
    hasGoldenCharterIssues,
    hasObligationChanges,
    restrictTypeTo,
  ]);

  const targetProps: Omit<
    ControlledTypeMultipleSelectProps<LinkedItemFields, DataItem>,
    'data' | 'loading'
  > = {
    control,
    name: 'Target',
    label: i18n.format(getEntityInfo(linkType).plural, 'capitalize'),
    parentType: linkType,
    renderTokens: true,
    excludedIds: excludeIds,
  };

  return (
    <>
      {!restrictTypeTo && (
        <ControlledSelect
          testId={'type'}
          control={control}
          name={'Type'}
          label={st('type')}
          placeholder={st('type_placeholder')}
          description={st('type_help')}
          options={typeOptions}
        />
      )}
      {linkType === Parent_Type_Enum.Acceptance && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={acceptanceData?.acceptance ?? []}
          loading={loadingAcceptances}
        />
      )}
      {linkType === Parent_Type_Enum.Action && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={actionData?.action ?? []}
          loading={loadingActions}
        />
      )}
      {linkType === Parent_Type_Enum.ThirdParty && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={thirdPartyData?.third_party ?? []}
          loading={loadingThirdParties}
        />
      )}
      {linkType === Parent_Type_Enum.Appetite && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={appetiteData?.appetite ?? []}
          loading={loadingAppetites}
        />
      )}
      {linkType === Parent_Type_Enum.Assessment && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={assessmentData?.assessment ?? []}
          loading={loadingAssessments}
        />
      )}
      {linkType === Parent_Type_Enum.Indicator && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={indicatorData?.indicator ?? []}
          loading={loadingIndicators}
        />
      )}
      {linkType === Parent_Type_Enum.Impact && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={impactData?.impact ?? []}
          loading={loadingImpacts}
        />
      )}
      {linkType === Parent_Type_Enum.Control && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={controlData?.control ?? []}
          loading={loadingControls}
        />
      )}
      {linkType === Parent_Type_Enum.ControlGroup && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={controlGroupData?.control_group ?? []}
          loading={loadingControlGroups}
        />
      )}
      {linkType === Parent_Type_Enum.Document && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={documentData?.document ?? []}
          loading={loadingDocuments}
        />
      )}
      {linkType === Parent_Type_Enum.Obligation && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={obligationData?.obligation ?? []}
          loading={loadingObligation}
        />
      )}
      {linkType === Parent_Type_Enum.ObligationChange && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={
            obligationChangeData?.obligation_change.map((oc) => ({
              ...oc,
              Title: oc.obligation?.Title ?? '-',
            })) ?? []
          }
          loading={loadingObligationChanges}
        />
      )}
      {linkType === Parent_Type_Enum.Risk && (
        <ControlledRiskMultiSelect
          control={control}
          name={'Target'}
          label={i18n.format(getEntityInfo(linkType).plural, 'capitalize')}
          testId={'target'}
          excludedIds={excludeIds}
          showEntityLabels={true}
        />
      )}
      {linkType === Parent_Type_Enum.Issue && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueData?.issue ?? []}
          loading={loadingIssues}
        />
      )}
      {linkType === Parent_Type_Enum.IssueBreachLog && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueBreachLogData?.issue ?? []}
          loading={loadingIssueBreachLogs}
        />
      )}
      {linkType === Parent_Type_Enum.IssueConsumerDuty && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueConsumerDutyData?.issue ?? []}
          loading={loadingIssueConsumerDuty}
        />
      )}
      {linkType === Parent_Type_Enum.IssueCustomerTrust && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueCustomerTrustData?.issue ?? []}
          loading={loadingIssueCustomerTrust}
        />
      )}
      {linkType === Parent_Type_Enum.IssueGdprBreachLog && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueGDPRBreachLogData?.issue ?? []}
          loading={loadingIssueGDPRBreachLog}
        />
      )}
      {linkType === Parent_Type_Enum.IssuePciBreachLog && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issuePCIBreachLogData?.issue ?? []}
          loading={loadingIssuePCIBreachLog}
        />
      )}
      {linkType === Parent_Type_Enum.IssueRiskEvent && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueRiskEventData?.issue ?? []}
          loading={loadingIssueRiskEvents}
        />
      )}
      {linkType === Parent_Type_Enum.IssueSarLog && (
        <ControlledTypedMultiselect
          {...targetProps}
          testId={'target'}
          data={issueSARLogData?.issue ?? []}
          loading={loadingIssueSARLog}
        />
      )}
    </>
  );
};

export default LinkedItemForm;
