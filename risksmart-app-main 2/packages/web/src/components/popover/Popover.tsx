import Badge from '@risk-smart/themed-cloudscape-components/badge';
import type { IconProps } from '@risk-smart/themed-cloudscape-components/icon';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import BasePopover from '@risk-smart/themed-cloudscape-components/popover';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC, JSX } from 'react';

type Item = {
  label: string;
  onClick: (() => void) | undefined;
  id: string;
};

import styles from './style.module.scss';
interface Props {
  items?: Item[] | null;
  title: string;
  iconName: IconProps.Name | null | undefined;
  icon: JSX.Element | undefined;
}

const Popover: FC<Props> = ({ items, title, icon, iconName }) => {
  return (
    <BasePopover
      dismissButton={true}
      position={'left'}
      size={'small'}
      header={title}
      content={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {items?.map((item) => (
            <Badge key={item.id}>{item.label}</Badge>
          ))}
        </SpaceBetween>
      }
    >
      <div>
        {icon ? (
          <div>
            <span className={'align-middle'}>{items?.length || '0'}&nbsp;</span>
            <span className={'align-middle'}>{icon}</span>
          </div>
        ) : (
          <>
            {items?.length || '0'}&nbsp;
            <>
              {iconName && (
                <Icon
                  variant={'subtle'}
                  size={'small'}
                  name={iconName}
                  {...{ className: styles.icon }}
                />
              )}
            </>
          </>
        )}
      </div>
    </BasePopover>
  );
};

export default Popover;
