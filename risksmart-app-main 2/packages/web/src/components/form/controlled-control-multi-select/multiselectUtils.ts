import type { GetControlsBasicQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

import { getFriendlyId } from '@/utils/friendlyId';

export const getOptions = (
  allControls: GetControlsBasicQuery | undefined,
  defaultValues: { value: string }[]
): { value: string; label: string; tags: string[] }[] => {
  const ids = defaultValues.map((d) => d.value);
  const controlsById = _.keyBy(allControls?.control, 'Id');

  let options: {
    Id: string;
    Title?: string;
    SequentialId?: null | number | undefined;
  }[] = allControls?.control ?? [];

  options = options.concat(
    (allControls?.node ?? []).filter(
      (n) => ids.includes(n.Id) && !controlsById[n.Id]
    )
  );

  return (
    options?.map((o) => ({
      value: o.Id,
      tags: o.Title
        ? [getFriendlyId(Parent_Type_Enum.Control, o.SequentialId)]
        : [],
      label: o.Title ?? getFriendlyId(Parent_Type_Enum.Control, o.SequentialId),
    })) ?? []
  );
};
