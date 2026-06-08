import { useQuery } from '@apollo/client';
import { GetRiskAssessmentResultConfigByVersionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import type { RiskAssessmentResultConfig } from './useGetLatestRiskAssessmentResultConfig';

export const useGetRiskAssessmentResultConfigByVersions = (
  versions: number[]
) => {
  const { data, loading } = useQuery(
    GetRiskAssessmentResultConfigByVersionsDocument,
    {
      variables: { versions },
      fetchPolicy: 'no-cache',
    }
  );

  const configByVersion = useMemo(() => {
    const map = new Map<number, RiskAssessmentResultConfig>();
    if (!data?.risk_assessment_result_config) {
      return map;
    }
    for (const record of data.risk_assessment_result_config) {
      map.set(record.Version, record.Config as RiskAssessmentResultConfig);
    }

    return map;
  }, [data]);

  return { configByVersion, loading };
};
