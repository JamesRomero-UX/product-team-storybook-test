import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { UNRATED } from '../controls/lookupData';
import { getCost } from '../issues/update/tabs/consequences/utils';
import type { ConsequenceFlatField, ConsequenceRegisterFields } from './types';

export const useLabelledFields = (
  records: ConsequenceFlatField[] | undefined
): ConsequenceRegisterFields[] | undefined => {
  const { t } = useTranslation('taxonomy');
  const { getByValue: getCriticalityByValue } = useRating('criticality');
  const { getLabel: getTypeByValue } = useRating('consequences_type');
  const { getByValue: getCommonLookupByValue } = useCommonLookupLazy();

  const status = useRating('issue_assessment_status');
  const severity = useRating('severity');

  return useMemo<ConsequenceRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const issueMapping =
        IssueTypeMapping[(d.issue?.Type ?? 'issue') as ParentIssueType];

      return {
        ...d,
        ModifiedByUserName: d.modifiedByUser?.FriendlyName || '-',
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        CriticalityLabelled: getCriticalityByValue(d.Criticality)?.label ?? '',
        CostTypeLabelled:
          getCommonLookupByValue('consequences.costType', d.CostType)?.label ??
          '-',
        IssueTitle: d.issue?.Title ?? '-',
        IssueSequentialId: d.issue?.SequentialId ?? null,
        IssueType: d.issue?.assessment?.IssueType ?? null,
        IssueTypeLabelled:
          getCommonLookupByValue(
            issueMapping.assessmentRatingTypeTaxonomy,
            d.issue?.assessment?.IssueType
          )?.label ?? '-',
        IssueStatus: d.issue?.assessment?.Status ?? null,
        IssueStatusLabelled: status.getLabel(
          d.issue?.assessment?.Status ?? null
        ),
        IssueRaisedDate: d.issue?.CreatedAtTimestamp ?? null,
        IssueClosedDate: d.issue?.assessment?.ActualCloseDate ?? null,
        IssueSeverity: d.issue?.assessment?.Severity ?? null,
        IssueSeverityLabelled:
          severity.getLabel(d.issue?.assessment?.Severity ?? null) ||
          UNRATED.label,
        TypeLabelled: d.Type ? getTypeByValue(d.Type) : '-',
        CostHours: getCost(d, Cost_Type_Enum.Hours),
        CostNumber: getCost(d, Cost_Type_Enum.Number),
        CostFinancial: getCost(d, Cost_Type_Enum.Financial),
        allOwners: d.issue ? getAllOwnersCellValue(d.issue) : [],
        allContributors: d.issue ? getAllContributorsCellValue(d.issue) : [],
        tags: d.issue?.tags ?? [],
        departments: d.issue?.departments ?? [],
        AssessmentDepartments: d.issue?.assessment?.departments ?? null,
        ParentTypeLabelled: i18n.format(
          t(issueMapping.entityLabel),
          'capitalize'
        ),
      };
    });
  }, [
    records,
    getCriticalityByValue,
    getCommonLookupByValue,
    status,
    severity,
    getTypeByValue,
    t,
  ]);
};
