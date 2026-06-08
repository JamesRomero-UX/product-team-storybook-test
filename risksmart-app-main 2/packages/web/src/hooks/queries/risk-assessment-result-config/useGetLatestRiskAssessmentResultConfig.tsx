import { useQuery } from '@apollo/client';
import { GetLatestRiskAssessmentResultConfigDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export interface RiskAssessmentResultConfig {
  likelihood: {
    ratings: {
      title: string;
      description?: string;
      value: number;
      color: string;
    }[];
  };
  impact: {
    ratings: {
      title: string;
      description?: string;
      value: number;
      color: string;
    }[];
    categories: {
      name: string;
      color: string;
    }[];
    aggregation: 'average' | 'maximum';
  };
  matrix: {
    title: string;
    value: number;
    color: string;
    likelihood: number;
    impact: number;
  }[];
}

export const useGetLatestRiskAssessmentResultConfig = (options?: {
  skip?: boolean;
}) => {
  const { data, loading, refetch } = useQuery(
    GetLatestRiskAssessmentResultConfigDocument,
    { skip: options?.skip }
  );

  const record = data?.risk_assessment_result_config[0];
  const config = record?.Config as RiskAssessmentResultConfig | undefined;

  return {
    config,
    loading,
    id: record?.Id,
    originalTimestamp: record?.ModifiedAtTimestamp,
    refetch,
  };
};
