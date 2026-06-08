import type { User } from '@risksmart-app/web-graphql-client/derived-types';
import type { FC } from 'react';

type CardUserAvatarProps = {
  userName: Pick<User, 'FirstName' | 'LastName'>;
};

const UserAvatar: FC<CardUserAvatarProps> = ({ userName }) => (
  <div
    className={
      'bg-teal text-navy text-sm flex items-center justify-center w-[30px] min-w-[30px] h-[30px] rounded-full'
    }
  >
    <span>{`${userName.FirstName?.charAt(0).toUpperCase()}${userName.LastName?.charAt(0).toUpperCase()}`}</span>
  </div>
);

export default UserAvatar;
