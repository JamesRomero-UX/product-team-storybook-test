import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import useLink from '@risksmart-app/components/src/hooks/use-link';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { createFindRisksInTier } from '@/utils/findRisksInTier';
import { getFriendlyId } from '@/utils/friendlyId';
import { enterpriseRiskDetailsUrl, enterpriseRiskUrl } from '@/utils/urls';

import type { EnterpriseRiskRegisterFields } from '../types';
import SelectedRiskAttribute from './SelectedRiskAttribute';
import styles from './style.module.scss';
import type {
  CardType,
  DashboardState,
  EnterpriseRiskAttribute,
} from './types';

const findRisksInTier = createFindRisksInTier<CardType>((risk) =>
  risk.unlinked ? undefined : risk.ParentId
);

export interface Props {
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;
  tier: 1 | 2 | 3;
  tierRisks: readonly EnterpriseRiskRegisterFields[];
  selectedRiskAttribute: EnterpriseRiskAttribute;
  onSelectionChange: (selectedItemId: string | undefined) => void;
}

const Tier: FC<Props> = ({
  tier = 1,
  dashboardState,
  setDashboardState,
  tierRisks,
  selectedRiskAttribute,
  onSelectionChange: handleSelectionChange,
}) => {
  const { handleFollow } = useLink({
    state: {
      from: 'enterprise-risk-dashboard',
    },
  });

  const selectedRiskId = dashboardState.get(tier);
  const parentRiskId = dashboardState?.get(tier - 1);

  const { t } = useTranslation(['common']);

  const tiers = t('tiers', { returnObjects: true });

  const tierLabel = tiers[String(tier) as keyof typeof tiers];

  const risks: CardType[] = [
    ...(tierRisks ?? []),
    {
      Id: 'unlinked',
      Title: t('enterpriseRisks.dashboard.unlinkedRisks'),
      Tier: tier,
      SequentialId: 0,
      unlinked: true,
    },
  ];

  const risksInTier = findRisksInTier(
    tier,
    risks,
    dashboardState,
    parentRiskId
  );

  // TODO: translation
  const empty = (
    <>
      {parentRiskId && risksInTier?.length === 0
        ? t('enterpriseRisks.dashboard.noItems')
        : ``}
    </>
  );

  const onSelectionChange: CardsProps<CardType>['onSelectionChange'] = ({
    detail,
  }) => {
    const newState: DashboardState = new Map();
    dashboardState.forEach((value, key) => {
      if (key === tier) {
        newState.set(key, detail.selectedItems[0].Id);
        handleSelectionChange(detail.selectedItems[0].Id);
      } else if (key > tier) {
        newState.set(key, undefined); // Clear all lower tiers
        handleSelectionChange(undefined);
      } else {
        newState.set(key, value);
        handleSelectionChange(value);
      }
    });
    setDashboardState(newState);
  };

  const selectedRisk = risks.find((r) => r.Id === selectedRiskId);
  const selectedItems = selectedRisk ? [selectedRisk] : [];

  return (
    <div className={styles.tier} data-testid={`tier-${tier}`}>
      <Container fitHeight variant={'stacked'}>
        <SpaceBetween direction={'vertical'} size={'m'}>
          <Header
            variant={'h2'}
            actions={
              <Permission
                permission={'insert:enterprise_risk'}
                canHaveAccessAsContributor={tier > 1}
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  href={`${enterpriseRiskUrl}/add?tier=${tier}`}
                  onFollow={handleFollow}
                >
                  {t('enterpriseRisks.dashboard.add')}
                </Button>
              </Permission>
            }
          >
            {tierLabel}
          </Header>
          <Cards<CardType>
            ariaLabels={{
              itemSelectionLabel: (e, n) =>
                t('enterpriseRisks.dashboard.select', n.Title),
              selectionGroupLabel: t(
                'enterpriseRisks.dashboard.selectionGroupLabel'
              ),
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
                          !item.unlinked
                            ? enterpriseRiskDetailsUrl(item.Id)
                            : undefined
                        }
                      >
                        <Header variant={'h3'} data-unlinked={item.unlinked}>
                          <span className={'text-base'}>{item.Title}</span>
                        </Header>
                      </Link>
                    </div>
                  ),
                },
              ],
              header: (item) => (
                <div className={'flex'}>
                  {!item.unlinked && (
                    <div className={'text-grey text-sm flex-grow'}>
                      {getFriendlyId(
                        Parent_Type_Enum.EnterpriseRisk,
                        item.SequentialId
                      )}
                    </div>
                  )}
                  <SelectedRiskAttribute
                    data={item}
                    selectedRiskAttribute={selectedRiskAttribute}
                  />
                </div>
              ),
            }}
            cardsPerRow={[{ cards: 1 }]}
            items={risksInTier}
            empty={empty}
            loadingText={t('enterpriseRisks.dashboard.loading')}
            visibleSections={['title']}
            selectionType={'single'}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            trackBy={(item) => item.Id}
          />
        </SpaceBetween>
      </Container>
    </div>
  );
};

export default Tier;
