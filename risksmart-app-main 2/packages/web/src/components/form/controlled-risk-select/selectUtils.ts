import type { GetRiskListOptimizedQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

import { getFriendlyId } from '@/utils/friendlyId';

export const getOptions = (
  data: GetRiskListOptimizedQuery | undefined,
  selectedRiskId: string | undefined
) => {
  const risksById = _.keyBy(data?.risk, 'Id');
  let options: {
    Id: string;
    Title?: string;
    SequentialId?: null | number | undefined;
  }[] = data?.risk ?? [];

  options = options.concat(
    (data?.node ?? []).filter(
      (n) => !risksById[n.Id] && n.Id === selectedRiskId
    )
  );

  return (
    options.map((r) => ({
      value: r.Id,
      label: r.Title ?? getFriendlyId(Parent_Type_Enum.Risk, r.SequentialId),
    })) ?? []
  );
};
