import type { RiskRegisterFields } from '../risks/types';

type CardData = RiskRegisterFields;

type UnlinkedType = Pick<
  CardData,
  'Entity' | 'Id' | 'SequentialId' | 'Tier' | 'Title'
> & {
  unlinked: true;
};

export type CardType = (CardData & { unlinked?: false }) | UnlinkedType;

export enum RiskAttribute {
  AppetitePerformance = 'appetitePerformance',
  ControlledRating = 'controlledRating',
  ImpactPerformance = 'impactPerformance',
  RiskStatus = 'riskStatus',
  UncontrolledRating = 'uncontrolledRating',
}

export type DashboardState = Map<number, string | undefined>;
