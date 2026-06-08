import Container from '@risk-smart/themed-cloudscape-components/container';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import clsx from 'clsx';
import dayjs from 'dayjs';
import type { FC } from 'react';

import styles from './style.module.scss';
import type { NotificationItem } from './useNotificationItems';

type Props = {
  item: NotificationItem;
  onArchive: () => void;
  onRead: () => void;
};

export const NotificationCell: FC<Props> = ({ item, onArchive, onRead }) => {
  return (
    <div className={styles.cell}>
      <Container variant={'stacked'}>
        <div className={'flex flex-row'}>
          <div
            className={clsx('flex-none rounded-full h-4 w-4', {
              'bg-teal': !item.feedItem.read_at && item.url !== null,
              'bg-grey': !!item.feedItem.read_at || item.url === null,
            })}
          ></div>
          <div className={'grow px-4 cursor-pointer'} onClick={onRead}>
            <div className={'text-sm font-semibold leading-4 mb-2 -mt-1'}>
              {item.message}
            </div>

            <div className={'text-grey500 text-xs'}>{item.id}</div>

            <div className={'text-grey500 text-xs'}>
              {dayjs(item.feedItem.inserted_at).format('HH:mm, D MMM YYYY')}
            </div>
          </div>

          <span
            className={'cursor-pointer hover:opacity-50 text-grey500 -mt-1'}
            onClick={(e) => {
              onArchive();
              e.preventDefault();
            }}
          >
            <Icon name={'close'} size={'small'} />
          </span>
        </div>
      </Container>
    </div>
  );
};
