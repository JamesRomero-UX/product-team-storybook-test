import Box from '@risk-smart/themed-cloudscape-components/box';
import { Dotpoints01, LogIn01 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '../../../link';
import UserMenuRow from './UserMenuRow';

interface MenuActionsRowProps {
  logoutUrl: string;
  handleOrgSwitch: () => void;
}

export const MenuActionsRow: FC<MenuActionsRowProps> = ({
  logoutUrl,
  handleOrgSwitch,
}) => {
  const { t } = useTranslation(['common']);

  const wrapperStyle =
    'text-white hover:bg-navy_light cursor-pointer flex items-center rounded-md gap-4 font-bold text-sm whitespace-nowrap py-1 truncate';
  const iconStyle = 'size-8 flex items-center justify-center';

  return (
    <UserMenuRow showSeparator={true} className={'menu-section'}>
      <Box>
        <div className={'flex flex-col gap-2 no-underline'}>
          <Link variant={'info'} onFollow={handleOrgSwitch}>
            <div className={wrapperStyle}>
              <div className={iconStyle}>
                <Dotpoints01 />
              </div>
              <div>{t('switchOrg')}</div>
            </div>
          </Link>
          <Link variant={'info'} href={logoutUrl}>
            <div className={wrapperStyle}>
              <div className={iconStyle}>
                <LogIn01 />
              </div>
              <div>{t('signOut')}</div>
            </div>
          </Link>
        </div>
      </Box>
    </UserMenuRow>
  );
};
