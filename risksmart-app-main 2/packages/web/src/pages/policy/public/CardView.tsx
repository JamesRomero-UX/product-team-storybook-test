import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CardTokens from 'src/components/card-tokens';
import Link from '@/components/link';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { toLocalDate } from '@/utils/dateUtils';
import { publicPolicyFileUrl } from '@/utils/urls';

import Cards from '../../../components/cards';
import type { DocumentFileTableFields } from './types';

const CardView: FC<
  Omit<CardsProps<DocumentFileTableFields>, 'cardDefinition'>
> = (props) => {
  const { getByValue: getAttestationRecordStatusByValue } = useRating(
    'attestation_record_status'
  );
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.columns',
  });

  return (
    <Cards
      {...props}
      cardDefinition={{
        header: (item) => (
          <div>
            {item.AttestationStatus && (
              <div className={'float-right'}>
                <SimpleRatingBadge
                  rating={getAttestationRecordStatusByValue(
                    item.AttestationStatus
                  )}
                />
              </div>
            )}
            <Link
              href={publicPolicyFileUrl(item.ParentDocumentId)}
              variant={'secondary'}
              fontSize={'heading-m'}
            >
              <div title={item.Title} className={'truncate'}>
                {item.Title}
              </div>
            </Link>
          </div>
        ),
        sections: [
          {
            id: 'summary',
            content: (item) => (
              <div className={'flex gap-4'}>
                <div>
                  {st('updatedOn')}
                  {':'}{' '}
                  <span className={'font-semibold'}>
                    {toLocalDate(item.ModifiedAtTimestamp)}
                  </span>
                </div>
                <div>
                  {st('version')}
                  {':'} <span className={'font-semibold'}>{item.Version}</span>
                </div>
              </div>
            ),
          },
          {
            id: 'owners',
            content: (item) => (
              <div>
                <CardTokens
                  tokens={item.allOwners.map((owner) => owner.label ?? '')}
                />
              </div>
            ),
          },
        ],
      }}
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 500, cards: 2 },
        { minWidth: 1200, cards: 4 },
      ]}
      trackBy={'Id'}
    />
  );
};

export default CardView;
