import { useMemo } from 'react';

import { useDashboardStore } from '../../useDashboardStore';

const useGetClickthroughEnabled = () => {
  const {
    myItemsFilters: {
      inheritedOwner,
      inheritedContributor,
      inheritedGroupOwner,
      inheritedGroupContributor,
    },
  } = useDashboardStore();

  const clickThroughEnabled = useMemo(
    () =>
      !inheritedOwner &&
      !inheritedContributor &&
      !inheritedGroupOwner &&
      !inheritedGroupContributor,
    [
      inheritedContributor,
      inheritedGroupContributor,
      inheritedGroupOwner,
      inheritedOwner,
    ]
  );

  return clickThroughEnabled;
};

export default useGetClickthroughEnabled;
