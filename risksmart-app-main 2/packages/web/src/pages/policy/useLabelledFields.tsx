import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Document_Assessment_Result } from '@risksmart-app/web-graphql-client/derived-types';
import {
  Approval_Status_Enum,
  Parent_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import type { RecursivePartial } from 'src/testing/stub';

import { getFriendlyId } from '@/utils/friendlyId';
import { calculateTrend } from '@/utils/trendCalculation';

import { getReviewStatus, getVersionStatusSortKey } from './helpers';
import type { DocumentFields, PolicyRegisterFields } from './types';

export const useLabelledFields = (
  records: DocumentFields[] | undefined,
  documentAssessmentResults:
    | Array<null | RecursivePartial<Document_Assessment_Result> | undefined>
    | undefined
): PolicyRegisterFields[] | undefined => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });
  const { t: tc } = useTranslation(['common']);
  const types = useMemo(() => st('types', { returnObjects: true }), [st]);
  const { getLabel: getPerformanceResultLabel } =
    useRating('performance_result');
  const { getLabel: getDocumentFileStatusLabel } = useRating(
    'document_file_status'
  );
  const { getLabel: getDocumentReviewStatusLabel } = useRating(
    'document_review_status'
  );
  const { getLabel: getRatingTrendLabel } = useRating('effectiveness_trend');
  const frequency = useMemo(() => tc('frequency'), [tc]);

  return useMemo<PolicyRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const latestAssessment = documentAssessmentResults?.find((dar) =>
        dar?.parents?.find((p) => p?.ParentId === d.Id)
      );

      const latestFile =
        d.documentFiles.length > 0 ? d.documentFiles[0] : undefined;

      const status = latestFile?.changeRequests.some(
        (cr) => cr.ChangeRequestStatus === Approval_Status_Enum.Pending
      )
        ? 'pending_approval'
        : latestFile?.Status;

      const lastApprovedDate = _.orderBy(
        latestFile?.changeRequests ?? [],
        ['ModifiedAtTimestamp'],
        ['desc']
      ).filter(
        (cr) => cr.ChangeRequestStatus === Approval_Status_Enum.Approved
      )[0]?.ModifiedAtTimestamp;

      // Calculate trend from assessmentResults (sorted by TestDate desc)
      const assessmentHistory = d.assessmentResults ?? [];
      const currentRating =
        assessmentHistory[0]?.documentAssessmentResult?.Rating;
      const previousRating =
        assessmentHistory[1]?.documentAssessmentResult?.Rating;
      const performanceTrend = calculateTrend(currentRating, previousRating);

      const isArchived = latestFile?.Status === Version_Status_Enum.Archived;
      const reviewStatusResult = getReviewStatus(
        latestFile?.NextReviewDate ?? null,
        isArchived
      );

      return {
        Id: d.Id,
        Title: d.Title,
        Parent: d.parent?.Title ?? null,
        DocumentType: types[d.DocumentType as keyof typeof types] ?? '-',
        OwnerName: d.owners,
        tags: d.tags,
        departments: d.departments,
        CreatedByUserName: d.createdByUser?.FriendlyName ?? null,
        ModifiedByUserName: d.modifiedByUser?.FriendlyName ?? null,
        CreatedByUserId: d.CreatedByUser,
        ModifiedByUserId: d.ModifiedByUser,
        CreatedAtTimestamp: d.CreatedAtTimestamp,
        ModifiedAtTimestamp: d.ModifiedAtTimestamp,
        PerformanceResultValue: latestAssessment?.Rating ?? null,
        PerformanceResult: getPerformanceResultLabel(
          latestAssessment?.Rating ?? null
        ),
        PerformanceTrend: performanceTrend,
        PerformanceTrendLabelled: getRatingTrendLabel(performanceTrend) || '-',
        Status: getDocumentFileStatusLabel(status ?? null) || '-',
        StatusValue: status ?? null,
        VersionStatusSortKey: getVersionStatusSortKey(status),
        ReviewDate: latestFile?.ReviewDate ?? null,
        NextReviewDate: latestFile?.NextReviewDate ?? null,
        ReviewStatus:
          getDocumentReviewStatusLabel(reviewStatusResult.value) || '-',
        ReviewStatusValue: reviewStatusResult.value,
        ReviewStatusSortKey: reviewStatusResult.sortKey,
        CustomAttributeData: d.CustomAttributeData ?? null,
        owners: d.owners,
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Document, d.SequentialId)
          : '',
        SequentialId: d.SequentialId,
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        Download: latestFile?.Status === 'published',
        TestFrequency: d.schedule?.Frequency
          ? frequency[d.schedule.Frequency]
          : null,
        LastApprovedDate: lastApprovedDate,
        NextTestDate: d.scheduleState?.DueDate ?? '-',
        LatestRatingDate: d.scheduleState?.LatestDate ?? '-',
        NextTestOverdueDate: d.scheduleState?.OverdueDate ?? '-',
        LastPublishedDate: d.latestPublishedVersion[0]?.PublishedDate ?? null,
        assessmentResults: d.assessmentResults,
      };
    });
  }, [
    getDocumentFileStatusLabel,
    getDocumentReviewStatusLabel,
    getPerformanceResultLabel,
    getRatingTrendLabel,
    records,
    types,
    documentAssessmentResults,
    frequency,
  ]);
};
