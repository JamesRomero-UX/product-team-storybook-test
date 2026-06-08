import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import useLink from '@risksmart-app/components/src/hooks/use-link';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import { internalAuditAddUrl, internalAuditDetailsUrl } from '@/utils/urls';

import type { InternalAuditRegisterFields } from '../types';
import styles from './style.module.scss';

type CardItem = {
  id: string;
  title: string;
  rating: { color: string; label: string; value: number } | null;
  SequentialId: null | number | undefined;
  isBusinessArea: boolean;
};
export interface Props {
  loading: boolean;
  type: 'businessArea' | 'internalAuditEntity';
  selectedId?: string;
  onSelectAction: (
    id: string,
    type: 'businessArea' | 'internalAuditEntity'
  ) => void;
  internalAudits: readonly InternalAuditRegisterFields[];
}
interface RatingsByValue {
  [key: number]: { label: string; color: string; value: number };
}

const unlinkedId = 'unlinked';

const cardItemsFromInternalAuditBusinessAreaData = (
  internalAudits: readonly InternalAuditRegisterFields[]
) => {
  const businessAreas = Array.from(
    new Map(
      internalAudits.map((item) => [item['businessArea']?.Id, item])
    ).values()
  );

  const cardItems: CardItem[] = businessAreas
    .filter((c) => c.businessArea)
    .map((item) => ({
      id: item.businessArea!.Id,
      title: item.businessArea!.Title,
      SequentialId: item.businessArea!.SequentialId,
      rating: null,
      isBusinessArea: true,
    }));

  return cardItems;
};

const cardItemsFromInternalAuditData = (
  internalAudits: readonly InternalAuditRegisterFields[],
  ratings: RatingsByValue,
  selectedId: string | undefined
) => {
  const cardItems: CardItem[] = internalAudits
    .filter((c) => c.businessArea?.Id === selectedId)
    .map((item) => ({
      id: item.Id,
      title: item.Title,
      SequentialId: item.SequentialId,
      rating: ratings[item.AuditRating || 0],
      isBusinessArea: false,
    }));

  return cardItems;
};

const Type: FC<Props> = ({
  type,
  onSelectAction,
  internalAudits,
  selectedId,
  loading,
}) => {
  const { handleFollow } = useLink({
    state: {
      from: 'compliance-dashboard',
    },
  });

  const { t } = useTranslation(['common'], {
    keyPrefix: 'internalAudits',
  });
  const { t: tc } = useTranslation(['common']);
  const { t: tr } = useTranslation(['ratings']);

  const [selectedItems, setSelectedItems] = useState<CardItem[]>([]);

  useEffect(() => {
    setSelectedItems([]);
  }, [selectedId]);

  const cardItems = useMemo<CardItem[]>(() => {
    const ratingsByValue: RatingsByValue = [
      ...tr('internal_audit_report_outcome'),
    ].reduce((sorted, res) => ({ ...sorted, [res.value]: res }), {});
    if (type === 'businessArea') {
      return cardItemsFromInternalAuditBusinessAreaData(internalAudits);
    }

    return cardItemsFromInternalAuditData(
      internalAudits,
      ratingsByValue,
      selectedId
    );
  }, [internalAudits, selectedId, tr, type]);

  const empty = cardItems.length === 0 ? tc('noItemsFound') : '';
  const onSelectionChange: CardsProps<CardItem>['onSelectionChange'] = ({
    detail,
  }) => {
    setSelectedItems(detail.selectedItems);
    onSelectAction(detail.selectedItems[0].id, type);
  };

  return (
    <div className={styles.type}>
      <Container fitHeight variant={'stacked'}>
        <SpaceBetween direction={'vertical'} size={'m'}>
          <Header
            variant={'h3'}
            actions={
              type !== 'businessArea' && (
                <Permission permission={'insert:internal_audit_entity'}>
                  <Button
                    iconName={'add-plus'}
                    variant={'primary'}
                    href={internalAuditAddUrl()}
                    onFollow={handleFollow}
                  >
                    {tc('create')}
                  </Button>
                </Permission>
              )
            }
          >
            {t('dashboard_category_titles')[type] || ''}
          </Header>
          <Cards<CardItem>
            ariaLabels={{
              itemSelectionLabel: (e, n) =>
                `${t('universe.select')} ${n.title}`,
              selectionGroupLabel: t('universe.itemSelection'),
            }}
            entireCardClickable={true}
            cardDefinition={{
              sections: [
                {
                  id: 'title',
                  content: (item) => (
                    <div className={'inline-block'}>
                      <Link
                        variant={'secondary'}
                        href={
                          item.id === unlinkedId || item.isBusinessArea
                            ? undefined
                            : internalAuditDetailsUrl(item.id)
                        }
                      >
                        <Header
                          variant={'h3'}
                          data-unlinked={item.id === unlinkedId}
                        >
                          <span className={'text-base'}>{item.title}</span>
                        </Header>
                      </Link>
                    </div>
                  ),
                },
              ],
              header: (item) =>
                item.id === unlinkedId ? null : (
                  <div className={'flex'}>
                    {item.id !== unlinkedId && (
                      <div className={'text-grey text-sm flex-grow'}>
                        {getFriendlyId(
                          !item.isBusinessArea
                            ? Parent_Type_Enum.InternalAuditEntity
                            : Parent_Type_Enum.BusinessArea,
                          item.SequentialId
                        )}
                      </div>
                    )}

                    {item.rating !== null && (
                      <SimpleRatingBadge rating={item.rating} />
                    )}
                  </div>
                ),
            }}
            cardsPerRow={[{ cards: 1 }]}
            items={cardItems}
            empty={empty}
            loading={loading}
            loadingText={t('loading_message')}
            visibleSections={['title']}
            selectionType={'single'}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            trackBy={(item) => item.id ?? item.title}
          />
        </SpaceBetween>
      </Container>
    </div>
  );
};

export default Type;
