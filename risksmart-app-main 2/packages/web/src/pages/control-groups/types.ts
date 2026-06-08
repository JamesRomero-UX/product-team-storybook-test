import type { GetControlGroupsFlatQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ControlGroupFlatFields = CollectionData<
  GetControlGroupsFlatQuery['control_group'][0]
>;

export type ControlGroupTableFields = ControlGroupFlatFields & {
  OwnerName: null | string;
  LinkedControlCount: null | number;
  CreatedByUserName: null | string;
};
