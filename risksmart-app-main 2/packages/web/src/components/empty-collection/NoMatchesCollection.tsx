import Button from '@risksmart-app/components/src/button';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyCollection from './EmptyCollection';

type Props = {
  onClearClick: () => void;
  hideClearButton?: boolean;
};

const NoMatchesCollection: FC<Props> = ({ onClearClick, hideClearButton }) => {
  const { t } = useTranslation(['common']);

  return (
    <EmptyCollection
      action={
        hideClearButton ? (
          <></>
        ) : (
          <Button onClick={onClearClick}>{t('clearFilter')}</Button>
        )
      }
      title={t('noMatches')}
      subtitle={t('noMatchFound')}
    />
  );
};

export default NoMatchesCollection;
