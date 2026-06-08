import type { TableProps } from '@risk-smart/themed-cloudscape-components';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import SimpleRatingBadge from '@risksmart-app/components/src/simple-rating-badge/SimpleRatingBadge';
import { DATE_TIME_FORMAT_WITH_TIME } from '@risksmart-app/i18n/src/i18n';
import { questionnaireUrl } from 'src/routes/urls';

import type { ThirdPartyResponse } from './types';

export function useColumnDefinitions() {
  const { getByValue } = useRating('third_party_response_status');

  const columnDefinitions: TableProps<ThirdPartyResponse>['columnDefinitions'] =
    [
      {
        id: 'title',
        header: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={questionnaireUrl(item.Id)}>
            {item.questionnaireTemplateVersion?.parent?.Title}
            {' -'} {item.questionnaireTemplateVersion?.Version}
          </Link>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (item) => <SimpleRatingBadge rating={getByValue(item.Status)} />,
        sortingField: 'Status',
      },
      {
        id: 'createdAt',
        header: 'Received',
        cell: (item) => {
          return new Date(item.CreatedAtTimestamp).toLocaleDateString(
            'en-GB',
            DATE_TIME_FORMAT_WITH_TIME
          );
        },
      },
      {
        id: 'updatedAt',
        header: 'Last modified',
        cell: (item) => {
          return new Date(item.ModifiedAtTimestamp).toLocaleDateString(
            'en-GB',
            DATE_TIME_FORMAT_WITH_TIME
          );
        },
      },
    ];

  return columnDefinitions;
}
