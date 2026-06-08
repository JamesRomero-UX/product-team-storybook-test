import Badge from '@risk-smart/themed-cloudscape-components/badge';
import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import useLink from '@risksmart-app/components/src/hooks/use-link';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { createFindRisksInTier } from '@/utils/findRisksInTier';
import { getFriendlyId } from '@/utils/friendlyId';
import { riskDetailsUrl } from '@/utils/urls';

import type { RiskRegisterFields } from '../risks/types';
import SelectedRiskAttribute from './SelectedRiskAttribute';
import styles from './style.module.scss';
import type { CardType, DashboardState, RiskAttribute } from './types';

const findRisksInTier = createFindRisksInTier<CardType>((risk) =>
  risk.unlinked ? undefined : risk.ParentRiskId
);

export interface Props {
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;
  tier: 1 | 2 | 3;
  tierRisks: readonly RiskRegisterFields[];
  selectedRiskAttribute: RiskAttribute;
}

const Tier: FC<Props> = ({
  tier = 1,
  dashboardState,
  setDashboardState,
  tierRisks,
  selectedRiskAttribute,
}) => {
  const { handleFollow } = useLink({
    state: {
      from: 'risk-dashboard',
    },
  });

  const selectedRiskId = dashboardState.get(tier);
  const parentRiskId = dashboardState?.get(tier - 1);

  const { t } = useTranslation(['common']);
  const { t: tt } = useTranslation(['taxonomy']);

  const isEnterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');

  const tiers = t('tiers', { returnObjects: true });

  const tierLabel = tiers[String(tier) as keyof typeof tiers];

  const risks: CardType[] = [
    ...(tierRisks ?? []),
    {
      Id: 'unlinked',
      // TODO: translation
      Title: 'Unlinked Risks',
      Tier: tier,
      unlinked: true,
      Entity: '-',
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
    <>{parentRiskId && risksInTier?.length === 0 ? 'No items found' : ``}</>
  );

  const onSelectionChange: CardsProps<CardType>['onSelectionChange'] = ({
    detail,
  }) => {
    const newState: DashboardState = new Map();
    dashboardState.forEach((value, key) => {
      if (key === tier) {
        newState.set(key, detail.selectedItems[0].Id);
      } else if (key > tier) {
        newState.set(key, undefined); // Clear all lower tiers
      } else {
        newState.set(key, value);
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
                permission={'insert:risk'}
                canHaveAccessAsContributor={tier > 1}
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  href={`/risks/add?tier=${tier}`}
                  onFollow={handleFollow}
                >
                  {'Add'}
                </Button>
              </Permission>
            }
          >
            {tierLabel}
          </Header>
          <Cards<CardType>
            ariaLabels={{
              // tod: translation
              itemSelectionLabel: (e, n) => `select ${n.Title}`,
              // tod: translation
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
                          !item.unlinked ? riskDetailsUrl(item.Id) : undefined
                        }
                      >
                        <Header variant={'h3'} data-unlinked={item.unlinked}>
                          <span className={'text-base'}>{item.Title}</span>
                        </Header>
                      </Link>
                      {isEnterpriseRiskEnabled && (
                        <span className={'text-grey text-sm'}>
                          {item.Entity}
                        </span>
                      )}
                    </div>
                  ),
                },
              ],
              header: (item) => (
                <div className={'flex'}>
                  {!item.unlinked && (
                    <div className={'text-grey text-sm flex-grow'}>
                      {getFriendlyId(Parent_Type_Enum.Risk, item.SequentialId)}
                      {isEnterpriseRiskEnabled ? (
                        item.enterpriseRiskInstance?.enterpriseRisk ? (
                          <Badge className={styles.badgeEnterprise}>
                            {i18n.format(tt('enterprise_one'), 'capitalize')}
                          </Badge>
                        ) : (
                          <Badge className={styles.badgeEntity}>
                            {i18n.format(tt('legal_entity_one'), 'capitalize')}
                          </Badge>
                        )
                      ) : null}
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
            // TODO: translation
            loadingText={'Loading'}
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
