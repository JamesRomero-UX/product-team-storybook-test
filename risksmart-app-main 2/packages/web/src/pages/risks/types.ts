import type { GetRisksFlatQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';
import type { TrendIndicator } from '@/utils/trendCalculation';

export type RiskFields = CollectionData<GetRisksFlatQuery['risk'][number]>;

export type RiskRegisterFields = Omit<RiskFields, 'TestFrequency'> & {
  TierLabelled: string;
  UncontrolledRatingLabelled: string;
  ControlledRatingLabelled: string;
  ParentTitle: null | string;
  UncontrolledRating: null | number;
  ControlledRating: null | number;
  UncontrolledScore: null | number;
  ControlledScore: null | number;
  LinkedControlCount: number;
  LinkedIndicatorCount: number;
  UserName: null | string;
  ControlledLikelihoodValue: null | number;
  ControlledImpactValue: null | number;
  UncontrolledImpactValue: null | number;
  UncontrolledLikelihoodValue: null | number;
  UncontrolledLikelihood: string;
  ControlledLikelihood: string;
  ControlledImpact: string;
  LowerAppetiteLabelled: null | string;
  UpperAppetiteLabelled: null | string;
  AppetitePerformanceLabelled: null | string;
  AppetitePerformance?: null | string;
  UncontrolledImpact: string;
  TreatmentLabelled: null | string;
  StatusLabelled: null | string;
  SequentialIdLabel: null | string;
  allOwners: { label: string; id: string }[];
  allContributors: { label: string; id: string }[];
  ImpactPerformanceScore: null | number;
  NextTestDate: null | string;
  NextTestOverdueDate: null | string;
  LatestRatingDate: null | string;
  TestScheduleStatus: null | string;
  TestScheduleStatusLabelled: null | string;
  TestFrequency: null | string;
  UncontrolledRatingHistory: {
    rating: number;
    likelihood: number | null;
    impact: number | null;
    id: string;
    testDate: string;
  }[];
  ControlledRatingHistory: {
    rating: number;
    likelihood: number | null;
    impact: number | null;
    id: string;
    testDate: string;
  }[];
  UncontrolledRatingTrend: TrendIndicator | null;
  UncontrolledRatingTrendLabelled: string;
  ControlledRatingTrend: TrendIndicator | null;
  ControlledRatingTrendLabelled: string;
  Entity: string;
  EnterpriseRiskLabelled: string;
};
