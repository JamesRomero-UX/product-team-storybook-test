import type { GetObligationListQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

import { getFriendlyId } from '@/utils/friendlyId';

export const getOptions = (
  allObligations: GetObligationListQuery | undefined,
  defaultValues: { value: string }[],
  excludedIds?: string[]
): { value: string; label: string }[] => {
  const ids = defaultValues.map((d) => d.value);
  const obligationsById = _.keyBy(allObligations?.obligation, 'Id');

  let options: {
    Id: string;
    Title?: string;
    SequentialId?: null | number | undefined;
  }[] = allObligations?.obligation ?? [];

  options = options.concat(
    (allObligations?.node ?? []).filter(
      (n) => ids.includes(n.Id) && !obligationsById[n.Id]
    )
  );

  return (
    options
      ?.filter((o) => !excludedIds?.includes(o.Id))
      .map((o) => ({
        value: o.Id,
        label:
          o?.Title ??
          getFriendlyId(Parent_Type_Enum.Obligation, o.SequentialId),
      })) ?? []
  );
};
