import i18next from '@risksmart-app/i18n/src/i18n';
import type { ParseKeys } from 'i18next';
import type { FC, JSX } from 'react';

import { labelWithPlural } from '@/utils/utils';

import EmptyCollection from './EmptyCollection';

type Props = {
  action: JSX.Element;
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  entityLabel: ParseKeys<'common'> | string;
};

const EmptyEntityCollection: FC<Props> = ({ action, entityLabel }) => {
  const labelValues = labelWithPlural(entityLabel);

  return (
    <EmptyCollection
      action={action}
      title={i18next.t('noItems', { entity: labelValues.plural })}
      subtitle={i18next.t('noItemsToDisplay', {
        entity: labelValues.plural,
      })}
    />
  );
};

export default EmptyEntityCollection;
