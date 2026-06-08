import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import CollectionPreferences from '@risk-smart/themed-cloudscape-components/collection-preferences';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import CardTokens from 'src/components/card-tokens';
import Cards from 'src/components/cards';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import UserAvatar from 'src/components/user-avatar';
import type { AttestationCardFields } from 'src/pages/attestations/user/types';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';
import type { TablePreferences } from '@/utils/table/types';
import { policyFileAttestationDetailsUrl } from '@/utils/urls';

export type CardProps = Omit<
  CardsProps<AttestationCardFields>,
  'cardDefinition' | 'preferences'
> & {
  preferences: TablePreferences<AttestationCardFields>;
  setPreferences: (
    preferences: TablePreferences<AttestationCardFields>
  ) => void;
};

const AttestationCards: FC<CardProps> = (props) => {
  const { getByValue: getAttestationRecordStatusByValue } = useRating(
    'attestation_record_status'
  );

  const { t } = useTranslation(['common'], { keyPrefix: 'attestations' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.columns',
  });
  const { t: tt } = useTranslation(['taxonomy']);

  return (
    <Cards
      {...props}
      cardDefinition={{
        header: (item) => (
          <div className={'flex flex-row items-center gap-3'}>
            {item.User.FirstName !== '-' && item.User.LastName !== '-' && (
              <UserAvatar userName={item.User} />
            )}
            <div className={'truncate '}>
              <Link
                href={policyFileAttestationDetailsUrl(
                  item.ParentDocumentId,
                  item.FileId
                )}
                fontSize={'heading-m'}
              >
                <div title={item.Title} className={'truncate'}>
                  {item.Title}
                </div>
              </Link>
            </div>
            {item.AttestationStatus && (
              <div className={'ml-auto'}>
                <SimpleRatingBadge
                  rating={getAttestationRecordStatusByValue(
                    item.AttestationStatus
                  )}
                />
              </div>
            )}
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
      visibleSections={props.preferences.visibleContent}
      trackBy={'FileId'}
      loadingText={t('loading_message')}
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 800, cards: 2 },
        { minWidth: 1100, cards: 3 },
        { minWidth: 1450, cards: 4 },
      ]}
      preferences={
        <CollectionPreferences
          onConfirm={({ detail }) => props.setPreferences(detail)}
          preferences={props.preferences}
          title={'Preferences'}
          confirmLabel={'Confirm'}
          cancelLabel={'Cancel'}
          pageSizePreference={{
            title: 'Page size',
            options: [
              { value: 10, label: `10 ${tt('attestation_other')}` },
              { value: 25, label: `25 ${tt('attestation_other')}` },
              { value: 50, label: `50 ${tt('attestation_other')}` },
            ],
          }}
          visibleContentPreference={{
            title: 'Select visible content',
            options: [
              {
                label: 'Properties',
                options: [
                  {
                    id: 'summary',
                    label: 'Summary',
                  },
                  { id: 'owners', label: 'Owners' },
                ],
              },
            ],
          }}
        />
      }
    />
  );
};

export default AttestationCards;
