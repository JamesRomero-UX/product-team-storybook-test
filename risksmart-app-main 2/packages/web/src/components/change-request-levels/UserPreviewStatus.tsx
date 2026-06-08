import type { IconProps } from '@risk-smart/themed-cloudscape-components/icon';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import styles from '@/components/change-request-levels/style.module.scss';

type UserPreviewStatusProps = {
  response?: boolean | null;
  hideIcon?: boolean;
  responseId?: null | string;
};

export const UserPreviewStatus = ({
  response,
  hideIcon,
  responseId,
}: UserPreviewStatusProps) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'approvals',
  });
  const { t: tc } = useTranslation(['common'], {});
  let style;
  let icon: IconProps.Name;
  let statusText;
  switch (response) {
    case true: {
      icon = 'status-positive';
      style = styles.iconApproved;
      statusText = t('status.approved');
      break;
    }
    case false: {
      icon = 'status-negative';
      style = styles.iconRejected;
      statusText = t('status.rejected');
      break;
    }
    default: {
      icon = 'status-pending' as IconProps.Name;
      statusText = t('status.pending');
    }
  }

  return (
    <>
      {!hideIcon && (
        <div>
          <Icon
            data-tooltip-id={`${responseId}-response-approval`}
            name={icon}
            className={style}
          />
          {responseId && (
            <Tooltip
              variant={'light'}
              place={'top-end'}
              id={`${responseId}-response-approval`}
              /* Tailwind not being honored by react-tooltip. */
              border={'2px solid #ededf2'}
              style={{ padding: 5 }}
            >
              <div className={'!m-0 p-0 flex gap-1 flex-col'}>
                <span className={'text-xs font-bold '}>
                  {tc('status')}
                  {':'}
                </span>
                <span className={'text-xs'}>{statusText}</span>
              </div>
            </Tooltip>
          )}
        </div>
      )}
    </>
  );
};
