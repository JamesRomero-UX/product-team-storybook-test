import Cards from '@risk-smart/themed-cloudscape-components/cards';

export type PreviousCycle = {
  title: string;
  version: string;
  totalAttestedCount: number;
};

type Props = {
  previousCycle: PreviousCycle;
};
export const PreviousAttestationCycleSummary: React.FC<Props> = (props) => {
  const { previousCycle } = props;

  return (
    <Cards<PreviousCycle>
      items={[previousCycle]}
      variant={'full-page'}
      cardDefinition={{
        header: (item) => item.title,
        sections: [
          {
            id: 'version',
            header: 'Version',
            content: (item: PreviousCycle) => item.version,
          },
          {
            id: 'totalAttestedCount',
            header: 'Total attested',
            content: (item: PreviousCycle) => item.totalAttestedCount,
          },
        ],
      }}
    />
  );
};
