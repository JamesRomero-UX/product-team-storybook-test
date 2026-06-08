import type { LinkProps } from '@risk-smart/themed-cloudscape-components/link';
import DefaultLink from '@risk-smart/themed-cloudscape-components/link';
import useLink from '@risksmart-app/components/src/hooks/use-link';
import type { FC } from 'react';
import { useLocation } from 'react-router';

interface Props extends LinkProps {
  isRelativeUrl?: boolean;
}

const Link: FC<Props> = ({ onFollow, href, isRelativeUrl, ...props }) => {
  const { handleFollow } = useLink();
  const { pathname } = useLocation();

  return (
    <DefaultLink
      href={isRelativeUrl ? `${pathname}/${href}` : href}
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
