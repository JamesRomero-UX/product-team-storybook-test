import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

import { getUserAvatarColor } from '../../../utils/colours';

interface UserAvatarProps {
  username: string | undefined;
}

export const UserAvatar: FC<UserAvatarProps> = ({ username }) => {
  return (
    <div className={'flex items-center justify-center'}>
      <div
        className={'size-8 rounded-full flex items-center justify-center'}
        style={{
          backgroundColor: getUserAvatarColor(username),
        }}
      >
        <Box>
          <span className={'text-white text-sm font-bold'}>
            {(username || 'User')
              .split(' ')
              .map((name: string) => name.charAt(0))
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </Box>
      </div>
    </div>
  );
};
