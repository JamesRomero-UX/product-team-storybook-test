import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import useLink from '@risksmart-app/components/src/hooks/use-link';
import {
  Obligation_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import { addObligationUrl, obligationDetailsUrl } from '@/utils/urls';

import type { ObligationTableFields } from '../types';
import styles from './style.module.scss';

type CardItem = {
  id: string;
  title: string;
  rating: { color: string; label: string; value: number } | null;
  SequentialId: null | number | undefined;
};
interface Props {
  loading: boolean;
  type: Obligation_Type_Enum;
  selectedId?: string;
  onSelectAction: (obligationId: string, type: Obligation_Type_Enum) => void;
  obligations: readonly ObligationTableFields[];
}
interface RatingsByValue {
  [key: number]: { label: string; color: string; value: number };
}

const childTypes: {
  [key in Obligation_Type_Enum]: Obligation_Type_Enum;
} = {
  [Obligation_Type_Enum.Standard]: Obligation_Type_Enum.Chapter,
  [Obligation_Type_Enum.Chapter]: Obligation_Type_Enum.Rule,
  [Obligation_Type_Enum.Rule]: Obligation_Type_Enum.Task,
  [Obligation_Type_Enum.Task]: Obligation_Type_Enum.Task,
};

const unlinkedId = 'unlinked';

const cardItemsFromData = (
  obligations: readonly ObligationTableFields[],
  type: Obligation_Type_Enum,
  title: string,
  ratings: RatingsByValue,
  selectedId: string | undefined
) => {
  const cardItems: CardItem[] = obligations
    .filter(
      (o) =>
        o.Type === type &&
        (o.ParentId === selectedId ||
          o.Type === Obligation_Type_Enum.Standard ||
          (selectedId === unlinkedId && _.isNil(o.ParentId)))
    )
    .map((item) => ({
      id: item.Id,
      title: item.Title,
      SequentialId: item.SequentialId,
      rating: ratings[item.LatestAssessmentResult || 0],
    }));

  if (
    type !== Obligation_Type_Enum.Task &&
    obligations.filter((o) => o.Type == childTypes[type] && _.isNil(o.ParentId))
      .length > 0
  ) {
    cardItems.push({
      title,
      rating: null,
      id: unlinkedId,
      SequentialId: 0,
    });
  }

  return cardItems;
};

const Type: FC<Props> = ({
  type,
  onSelectAction,
  obligations,
  selectedId,
  loading,
}) => {
  const { handleFollow } = useLink({
    state: {
      from: 'compliance-dashboard',
    },
  });

  const { t } = useTranslation(['common'], {
    keyPrefix: 'obligations',
  });
  const { t: tc } = useTranslation(['common']);
  const { t: tr } = useTranslation(['ratings']);

  const [selectedItems, setSelectedItems] = useState<CardItem[]>([]);
  let empty = '';
  const cardItems = useMemo<CardItem[]>(() => {
    const ratingsByValue: RatingsByValue = [
      ...tr('performance_result_unrated'),
      ...tr('performance_result'),
    ].reduce((sorted, res) => ({ ...sorted, [res.value]: res }), {});

    return cardItemsFromData(
      obligations,
      type,
      t('orphaned_obligation_title'),
      ratingsByValue,
      selectedId
    );
  }, [obligations, selectedId, t, tr, type]);

  empty = cardItems.length === 0 ? tc('noItemsFound') : '';
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
              <Permission
                permission={'insert:obligation'}
                canHaveAccessAsContributor={
                  type !== Obligation_Type_Enum.Standard
                }
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  href={addObligationUrl(type)}
                  onFollow={handleFollow}
                >
                  {tc('create')}
                </Button>
              </Permission>
            }
          >
            {t('dashboard_category_titles')[type] || ''}
          </Header>
          <Cards<CardItem>
            ariaLabels={{
              // todo: Translation
              itemSelectionLabel: (e, n) => `select ${n.title}`,
              // todo: Translation
              selectionGroupLabel: 'Item selection',
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
                          item.id !== unlinkedId
                            ? obligationDetailsUrl(item.id)
                            : undefined
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
                          Parent_Type_Enum.Obligation,
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
