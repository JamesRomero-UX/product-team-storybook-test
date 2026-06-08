import {
  PreviousAttestationCycleSummary,
  type PreviousCycle,
} from './PreviousAttestationCycleSummary';
import type {
  ProposedCycleWithoutActiveCycle,
  ProposedCycleWithReissue,
} from './ProposedAttestationCycleSummary';
import {
  ProposedAttestationCycleSummary,
  type ProposedCycle,
} from './ProposedAttestationCycleSummary';

export type AttestationSummaryCardsPropsWithReissue = {
  proposedCycle: ProposedCycleWithReissue | ProposedCycleWithoutActiveCycle;
  previousCycle?: undefined;
};

export type AttestationSummaryCardsPropsWithoutReissue = {
  proposedCycle: ProposedCycle;
  previousCycle: PreviousCycle;
};

export type AttestationSummaryCardsProps =
  | AttestationSummaryCardsPropsWithReissue
  | AttestationSummaryCardsPropsWithoutReissue;

export const AttestationSummaryCards: React.FC<
  AttestationSummaryCardsProps
> = ({ proposedCycle, previousCycle }) => {
  return (
    <>
      <ProposedAttestationCycleSummary proposedCycle={proposedCycle} />
      {previousCycle && (
        <PreviousAttestationCycleSummary previousCycle={previousCycle} />
      )}
    </>
  );
};
