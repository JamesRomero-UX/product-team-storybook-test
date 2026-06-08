import type { LinkProps } from '@risk-smart/themed-cloudscape-components/link';
import DefaultLink from '@risk-smart/themed-cloudscape-components/link';
import type { FC } from 'react';

import useLink from '../hooks/use-link';

const Link: FC<LinkProps> = ({ onFollow, ...props }) => {
  const { handleFollow } = useLink();

  return (
    <DefaultLink
      onFollow={
        onFollow
          ? (e) => {
              e.preventDefault();
              onFollow(e);
            }
          : handleFollow
      }
      {...props}
    />
  );
};

export default Link;
