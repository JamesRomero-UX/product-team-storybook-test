import Cards from '@risk-smart/themed-cloudscape-components/cards';
import { useTranslation } from 'react-i18next';

type CommonProps = {
  attestationRequiredCount: number;
  reissueCycle?: boolean;
  title: string;
  version: string;
};

export type ProposedCycleWithoutActiveCycle = CommonProps & {
  reissueCycle?: never;
};

export type ProposedCycleWithReissue = CommonProps & {
  reissueCycle: true;
};

export type ProposedCycleWithoutReissue = CommonProps & {
  reissueCycle: false;
  carriedForwardCount: number;
};

export type ProposedCycle =
  | ProposedCycleWithoutActiveCycle
  | ProposedCycleWithReissue
  | ProposedCycleWithoutReissue;

type Props = {
  proposedCycle: ProposedCycle;
};

const isProposedCycleWithoutReissue = (
  proposedCycle: ProposedCycle
): proposedCycle is ProposedCycleWithoutReissue => {
  return proposedCycle.reissueCycle === false;
};

const isProposedCycleWithoutActiveCycle = (
  proposedCycle: ProposedCycle
): proposedCycle is ProposedCycleWithoutActiveCycle => {
  return proposedCycle.reissueCycle === undefined;
};

export const ProposedAttestationCycleSummary: React.FC<Props> = ({
  proposedCycle,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'attestations' });

  const visibleSections = ['version', 'attestationRequiredCount'];

  if (!isProposedCycleWithoutActiveCycle(proposedCycle)) {
    visibleSections.push('reissueCycle');
  }
  if (isProposedCycleWithoutReissue(proposedCycle)) {
    visibleSections.push('carriedForwardCount');
  }

  return (
    <Cards<ProposedCycle>
      items={[proposedCycle]}
      cardDefinition={{
        header: (item) => item.title,
        sections: [
          {
            id: 'version',
            header: t('cardText.version'),
            content: (item: ProposedCycle) => item.version,
          },
          {
            id: 'reissueCycle',
            header: t('cardText.reissue'),
            content: (item: ProposedCycle) =>
              item.reissueCycle ? 'Yes' : 'No',
          },
          {
            id: 'attestationRequiredCount',
            header: t('cardText.requireAttestations'),
            content: (item: ProposedCycle) => item.attestationRequiredCount,
          },
          {
            id: 'carriedForwardCount',
            header: t('cardText.transferOver'),
            content: (item: ProposedCycleWithoutReissue) =>
              item.carriedForwardCount,
          },
        ],
      }}
      visibleSections={visibleSections}
    />
  );
};
