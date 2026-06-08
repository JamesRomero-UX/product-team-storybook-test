import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { getFriendlyId } from '@/utils/friendlyId';

import type { InternalAuditFields, InternalAuditRegisterFields } from './types';

export const ReportStatusEnum = {
  Unallocated: 'unallocated',
  Inprogress: 'inprogress',
  Planned: 'planned',
  NotScheduled: 'notscheduled',
} as const;

type TReportStatusEnum =
  (typeof ReportStatusEnum)[keyof typeof ReportStatusEnum];

export const useLabelledFields = (
  records: InternalAuditFields[] | undefined
) => {
  const { getLabel: getStatusLabel } = useRating(
    'internal_audit_entity_status',
    'internal_audit'
  );

  const { getLabel: getOutcomeLabel } = useRating(
    'internal_audit_report_outcome',
    'internal_audit'
  );

  return useMemo<InternalAuditRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const completedReports = d.internalAuditReports.filter(
        (d) => d?.ActualCompletionDate && d.Status === 'complete'
      );

      let latestReport = undefined;

      if (completedReports.length > 0) {
        latestReport = completedReports.reduce((r, o) =>
          new Date(o.ActualCompletionDate!) > new Date(r.ActualCompletionDate!)
            ? o
            : r
        );
      }

      let reportStatus: TReportStatusEnum = ReportStatusEnum.Unallocated;

      if (
        d.internalAuditReports.filter((c) => c?.Status === 'inprogress')
          .length > 0
      ) {
        reportStatus = ReportStatusEnum.Inprogress;
      } else if (
        d.internalAuditReports.filter((c) => c?.Status === 'notstarted')
          .length > 0
      ) {
        reportStatus = ReportStatusEnum.Planned;
      } else if (
        d.internalAuditReports.filter((c) => c?.Status === 'complete').length >
        0
      ) {
        reportStatus = ReportStatusEnum.NotScheduled;
      }

      return {
        ...d,
        SequentialIdLabel: getFriendlyId(
          Parent_Type_Enum.InternalAuditEntity,
          d.SequentialId
        ),
        Title: d.Title || '-',
        CreatedBy: d.CreatedByUser || '-',
        UserName: d.createdByUser?.FriendlyName ?? null,
        ModifiedBy: d.ModifiedByUser || '-',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        BusinessArea: d.businessArea?.Title || '-',
        LatestReportDate: latestReport?.ActualCompletionDate || '-',
        AuditRating: latestReport?.Outcome,
        AuditRatingLabelled: latestReport?.Outcome
          ? getOutcomeLabel(latestReport?.Outcome)
          : '-',
        OpenActionCount: d.actions.filter((c) => c.action?.Status !== 'closed')
          .length,
        OpenIssueCount: d.issues.filter(
          (c) => c.issue?.assessment?.Status !== 'closed'
        ).length,
        ReportStatus: reportStatus,
        ReportStatusLabelled: reportStatus ? getStatusLabel(reportStatus) : '-',
      };
    });
  }, [records, getStatusLabel, getOutcomeLabel]);
};
