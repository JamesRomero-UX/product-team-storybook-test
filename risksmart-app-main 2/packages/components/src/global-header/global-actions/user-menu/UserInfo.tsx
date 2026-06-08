import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

interface UserInfoProps {
  primaryText?: string;
  secondaryText?: string;
}

export const UserInfo: FC<UserInfoProps> = ({ primaryText, secondaryText }) => {
  return (
    <Box>
      <div
        className={
          'flex flex-col justify-center flex-1 min-w-0 overflow-hidden gap-y-2 max-w-[144px]'
        }
      >
        <div
          className={`text-sm font-semibold text-white leading-tight truncate`}
        >
          {primaryText || 'User'}
        </div>
        <div className={'text-xs text-grey leading-tight truncate'}>
          {secondaryText || 'Organization'}
        </div>
      </div>
    </Box>
  );
};
