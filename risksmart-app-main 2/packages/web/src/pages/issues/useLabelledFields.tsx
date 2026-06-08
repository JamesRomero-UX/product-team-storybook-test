import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import { notEmpty } from 'src/utilityTypes';

import { isIssueStatusOverdue } from '@/components/issues-status-badge/utils';
import useEntityInfo from '@/hooks/getEntityInfo';
import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { UNRATED } from '../controls/lookupData';
import type { IssueFlatField, IssueRegisterFields } from './types';
import { calculateCostTotal } from './update/tabs/consequences/utils';

export const useLabelledFields = (
  issueType: ParentIssueType,
  records: IssueFlatField[] | undefined
): IssueRegisterFields[] | undefined => {
  const isComplianceVisibleToOrg = useIsModuleEnabled('obligation');
  const isPolicyVisibleToOrg = useIsModuleEnabled('document');
  const issueMapping = IssueTypeMapping[issueType];
  const { t } = useTranslation(['common']);
  const issueTypes = useMemo(
    () =>
      t(issueMapping.assessmentRatingTypeTaxonomy, {
        returnObjects: true,
      }),
    [t, issueMapping]
  );

  const status = useRating('issue_assessment_status');
  const severity = useRating('severity');
  const { getByValue } = useCommonLookupLazy();
  const getEntityInfo = useEntityInfo();

  return useMemo<IssueRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const parentTitle = d.parents
        .map((p) => {
          if (!p?.parent?.ObjectType) {
            return;
          }
          const entityInfo = getEntityInfo(p?.parent?.ObjectType);

          return {
            label: `${
              p.parent.ObjectType && p.parent.SequentialId
                ? `${getFriendlyId(p.parent.ObjectType, p.parent.SequentialId)}: `
                : ''
            }${entityInfo.getTitle?.(p) ?? '-'} (${entityInfo.singular})`,
            url: entityInfo.url(p.parent.Id),
          };
        })
        .filter(notEmpty);
      const parentId: null | string = null;

      const issueStatus =
        d.assessment?.Status &&
        isIssueStatusOverdue({
          item: {
            Status: d.assessment?.Status,
            TargetCloseDate: d.assessment?.TargetCloseDate,
          },
        })
          ? (status.getByValue('overdue')?.label ?? '')
          : status.getLabel(d.assessment?.Status ?? null);

      return {
        ...d.assessment!,
        ...d,
        InternalOrExternalIssue: _.isNil(d.IsExternalIssue)
          ? null
          : (getByValue(
              `${issueMapping.taxonomy}.isExternalIssue`,
              d.IsExternalIssue.toString()
            )?.label ?? null),
        IssueTypeLabelled: d.assessment?.IssueType
          ? issueTypes[d.assessment.IssueType as keyof typeof issueTypes] //TODO get IssueType as enum
          : '-',
        SeverityLabelled:
          severity.getLabel(d.assessment?.Severity ?? null) || UNRATED.label,
        StatusLabelled: issueStatus,
        ParentTitle: parentTitle,
        ParentId: parentId,
        OpenActions: d.actions_aggregate.aggregate?.count ?? null,
        ...(isPolicyVisibleToOrg
          ? {
              PoliciesBreached:
                d.parents
                  ?.filter((parent) => parent.document)
                  .map((parent) => parent.document?.Title)
                  .join(', ') ?? '-',
            }
          : []),
        ...(isComplianceVisibleToOrg
          ? {
              RegulationsBreached:
                d.parents
                  ?.filter((parent) => parent.obligation)
                  .map((parent) => parent.obligation?.Title)
                  .join(', ') ?? '-',
            }
          : []),
        ModifiedByUserName: d.modifiedByUser?.FriendlyName || '-',
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        AssessmentCreatedBy: d.assessment?.createdByUser?.FriendlyName || '-',
        AssessmentModifiedBy: d.assessment?.modifiedByUser?.FriendlyName || '-',
        Severity: d.assessment?.Severity ?? null,
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(issueType, d.SequentialId)
          : '',
        AssessmentDepartments: d.assessment?.departments ?? null,
        CustomAttributeData: {
          ...(d.CustomAttributeData || {}),
          ...(d.assessment?.CustomAttributeData || {}),
        },
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        Cost: calculateCostTotal(
          d.consequences ?? [],
          Cost_Type_Enum.Financial
        ),
        Hours: calculateCostTotal(d.consequences ?? [], Cost_Type_Enum.Hours),
        CustomersImpacted: calculateCostTotal(
          d.consequences ?? [],
          Cost_Type_Enum.CustomersImpacted
        ),
        CertifiedIndividual:
          d.assessment?.certifiedIndividual?.FriendlyName || '-',
        TimeToResolve:
          d.assessment?.ActualCloseDate && d.CreatedAtTimestamp
            ? dayjs(d.assessment?.ActualCloseDate).diff(
                dayjs(d.CreatedAtTimestamp),
                'days'
              )
            : null,
        TimeToReport: dayjs(d.CreatedAtTimestamp).diff(
          d.DateIdentified,
          'days'
        ),
        TimeToIdentify: dayjs(d.DateIdentified).diff(d.DateOccurred, 'days'),
        TimeSinceCreated: dayjs().diff(dayjs(d.CreatedAtTimestamp), 'days'),
        UpdateCount: d.issueUpdateSummary?.Count ?? 0,
        LatestUpdateTitle: d.issueUpdateSummary?.LatestTitle ?? null,
        LatestUpdateDescription:
          d.issueUpdateSummary?.LatestDescription ?? null,
        LatestUpdateCreatedAtTimestamp:
          d.issueUpdateSummary?.LatestCreatedAtTimestamp ?? null,
      };
    });
  }, [
    records,
    status,
    issueTypes,
    severity,
    isPolicyVisibleToOrg,
    isComplianceVisibleToOrg,
    issueType,
    getEntityInfo,
    getByValue,
    issueMapping.taxonomy,
  ]);
};
