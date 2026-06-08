import type { GetIndicatorsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type IndicatorFlatFields = CollectionData<
  GetIndicatorsByParentIdQuery['indicator'][number]
>;

export type IndicatorTableFields =
  GetIndicatorsByParentIdQuery['indicator'][number] & {
    LatestResultDate: string | undefined;
    LatestResultValue: string | undefined;
    ConformanceLabelled: string | undefined;
    TestFrequencyLabelled: string | undefined;
  };
