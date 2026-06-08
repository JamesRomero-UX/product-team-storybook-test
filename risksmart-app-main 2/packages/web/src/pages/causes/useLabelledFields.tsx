import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
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
import type { CauseFlatField, CauseRegisterFields } from './types';

export const useLabelledFields = (
  records: CauseFlatField[] | undefined
): CauseRegisterFields[] | undefined => {
  const { t } = useTranslation('taxonomy');
  const { getByValue } = useRating('significance');
  const status = useRating('issue_assessment_status');
  const severity = useRating('severity');
  const { getByValue: getCommonLookupByValue } = useCommonLookupLazy();

  return useMemo<CauseRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const issueMapping =
        IssueTypeMapping[(d.issue?.Type ?? 'issue') as ParentIssueType];

      return {
        ...d,
        ModifiedByUserName: d.modifiedByUser?.FriendlyName || '-',
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        IssueTitle: d.issue?.Title ?? '-',
        IssueSequentialId: d.issue?.SequentialId ?? null,
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
        SignificanceLabelled: getByValue(d.Significance)?.label ?? '-',
        allOwners: d.issue ? getAllOwnersCellValue(d.issue) : [],
        allContributors: d.issue ? getAllContributorsCellValue(d.issue) : [],
        AssessmentDepartments: d.issue?.assessment?.departments ?? null,
        IssueType: d.issue?.assessment?.IssueType,
        IssueTypeLabelled:
          getCommonLookupByValue(
            issueMapping.assessmentRatingTypeTaxonomy,
            d.issue?.assessment?.IssueType
          )?.label ?? '-',
        ParentTypeLabelled: i18n.format(
          t(issueMapping.entityLabel),
          'capitalize'
        ),
      };
    });
  }, [records, status, severity, getByValue, getCommonLookupByValue, t]);
};
