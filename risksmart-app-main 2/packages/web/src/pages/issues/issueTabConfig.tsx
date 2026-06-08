import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { GetIssuesByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

type IssueFields = GetIssuesByParentIdQuery['issue'][0];

export type IssueTableFields = IssueFields & {
  TargetCloseDate: null | string;
  Severity: null | number;
  Status: null | string;
};

export function useGetIssueColumnDefinitions(type: ParentIssueType) {
  const issueMapping = IssueTypeMapping[type];
  const { getByValue: getSeverityByValue } = useRating('severity');
  const { getByValue: getStatusByValue } = useRating('issue_assessment_status');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: `${issueMapping.taxonomy}.columns`,
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const issueColumnDefinitions: TableProps<IssueTableFields>['columnDefinitions'] =
    [
      {
        id: 'title',
        header: st('title'),
        cell: (item) => (
          <Link variant={'secondary'} href={`${item.Id}`}>
            {item.Title}
          </Link>
        ),
        sortingField: 'Title',
        isRowHeader: true,
      },
      {
        id: 'owners',
        header: t('owners'),
        cell: (item) => {
          return (
            <BadgeList
              badges={getAllOwnersCellValue(item).map(
                (ownersCellValue) => ownersCellValue.label
              )}
            />
          );
        },
      },
      {
        id: 'severity',
        header: st('severity'),
        cell: (item) => (
          <SimpleRatingBadge rating={getSeverityByValue(item.Severity)} />
        ),
        sortingField: 'Severity',
      },

      {
        id: 'status',
        header: st('status'),
        cell: (item) => {
          const rating = getStatusByValue(item.Status);

          return <SimpleRatingBadge rating={rating} />;
        },
        sortingField: 'Status',
      },
      {
        id: 'dateIdentified',
        header: st('raised'),
        cell: (item) => toLocalDate(item.DateIdentified) || '-',
        sortingField: 'DateIdentified',
      },
      {
        id: 'targetCloseDate',
        header: st('target_close_date'),
        cell: (item) =>
          item.TargetCloseDate ? toLocalDate(item.TargetCloseDate) || '-' : '-',
        sortingField: 'TargetCloseDate',
      },
      {
        id: 'tags',
        header: t('tags'),
        cell: (item) => {
          return (
            <BadgeList
              badges={item.tags
                .map((tag) => tag.type?.Name)
                .filter((e) => e != null)}
            />
          );
        },
        sortingField: 'tags',
      },
    ];

  return issueColumnDefinitions;
}
