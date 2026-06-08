import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { RiskAttribute } from 'src/pages/risk-dashboard/types';
import type { RiskRegisterFields } from 'src/pages/risks/types';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import { riskDetailsUrl } from '@/utils/urls';

import SelectedRiskAttribute from '../../risk-dashboard/SelectedRiskAttribute';
import styles from './style.module.scss';

export interface Props {
  loading: boolean;
  risks: readonly RiskRegisterFields[];
  selectedInternalAuditEntityId: string | undefined;
  selectedRiskAttribute: RiskAttribute;
}

const Type: FC<Props> = ({
  risks,
  loading,
  selectedRiskAttribute,
  selectedInternalAuditEntityId,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'internalAudits',
  });
  const { t: rt } = useTranslation(['common'], {
    keyPrefix: 'risks',
  });
  const { t: tc } = useTranslation(['common']);

  const empty = risks.length === 0 ? tc('noItemsFound') : '';

  return (
    <div className={styles.type}>
      <Container fitHeight variant={'stacked'}>
        <SpaceBetween direction={'vertical'} size={'m'}>
          <Header
            variant={'h2'}
            actions={
              selectedInternalAuditEntityId && (
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  href={`/internal-audits/${selectedInternalAuditEntityId}/risks`}
                >
                  {t('riskTab.addButton')}
                </Button>
              )
            }
          >
            {t('dashboard_category_titles.risks')}
          </Header>
          <Cards<RiskRegisterFields>
            ariaLabels={{
              itemSelectionLabel: (e, n) =>
                `${t('universe.select')} ${n.Title}`,
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
                        href={riskDetailsUrl(item.Id)}
                      >
                        <Header variant={'h3'}>
                          <span className={'text-base'}>{item.Title}</span>
                        </Header>
                      </Link>
                    </div>
                  ),
                },
              ],
              header: (item) => (
                <div className={'flex'}>
                  <div className={'text-grey text-sm flex-grow'}>
                    {getFriendlyId(Parent_Type_Enum.Risk, item.SequentialId)}
                  </div>

                  <SelectedRiskAttribute
                    data={item}
                    selectedRiskAttribute={selectedRiskAttribute}
                  />
                </div>
              ),
            }}
            cardsPerRow={[{ cards: 1 }]}
            items={risks}
            empty={empty}
            loadingText={rt('loading_message')}
            visibleSections={['title']}
            selectionType={'single'}
            trackBy={(item) => item.Id}
            loading={loading}
          />
        </SpaceBetween>
      </Container>
    </div>
  );
};

export default Type;
