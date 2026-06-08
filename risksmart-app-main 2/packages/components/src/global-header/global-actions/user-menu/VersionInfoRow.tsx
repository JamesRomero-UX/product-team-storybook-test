import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UserMenuRow from './UserMenuRow';

export const VersionInfoRow: FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <UserMenuRow className={'rounded-b-[10px]'} showSeparator={false}>
      <div className={'text-grey text-xs'}>
        {/* Ignore 'cant find name' ts2304 as we want to use the env variable */}
        {/* @ts-ignore */}
        {`${t('appVersionTitle')}: ${__COMMIT_HASH__}`}
      </div>
    </UserMenuRow>
  );
};
