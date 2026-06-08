import type { EnterpriseRiskRegisterFields } from '../types';

type CardData = EnterpriseRiskRegisterFields;

type UnlinkedType = Pick<CardData, 'Id' | 'SequentialId' | 'Tier' | 'Title'> & {
  unlinked: true;
};

export type CardType = (CardData & { unlinked?: false }) | UnlinkedType;

export type DashboardState = Map<number, string | undefined>;

export enum EnterpriseRiskAttribute {
  InherentMean = 'inherentMean',
  InherentWorstCase = 'inherentWorstCase',
  ResidualMean = 'residualMean',
  ResidualWorstCase = 'residualWorstCase',
}
