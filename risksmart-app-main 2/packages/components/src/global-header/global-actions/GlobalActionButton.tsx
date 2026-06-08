import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC, ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

import { colours } from '../../utils/colours';
import styles from '../style.module.scss';

interface Props {
  icon: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  badge?: number | string;
  disabled?: boolean;
  iconColor?: string;
  tooltip?: string;
  isActive?: boolean;
  'data-testid'?: string;
}

const GlobalActionButton: FC<Props> = ({
  icon,
  onClick,
  ariaLabel,
  badge,
  disabled = false,
  iconColor = colours['icon-default'].backgroundColor,
  tooltip,
  isActive = false,
  'data-testid': testId,
}) => {
  const tooltipId = `global-action-${ariaLabel.replace(/\s+/g, '-').toLowerCase()}`;
  const tooltipText = tooltip || ariaLabel;

  return (
    <div className={'flex items-center'}>
      <button
        data-active={isActive}
        className={
          'transition-all bg-transparent relative border-none cursor-pointer p-0 ' +
          'opacity-80 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ' +
          'enabled:data-[active=false]:hover:opacity-100'
        }
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        data-tooltip-id={tooltipId}
        data-testid={testId}
      >
        <Box>
          <div
            data-active={isActive}
            className={`flex justify-center items-center data-[active=true]:text-teal`}
            // TODO: Remove this and replace with correct colour class names when managed in our own tailwind config
            style={{ color: isActive ? undefined : iconColor }}
          >
            {icon}
          </div>
          {badge && (
            <div
              className={
                'flex justify-center items-center absolute w-max min-w-4 h-4 top-[1px] left-[12px] ' +
                'rounded-full bg-teal text-navy font-bold text-center text-[9px] leading-[12px]'
              }
            >
              <div className={'w-full justify-center items-center mx-1'}>
                {typeof badge === 'number' && badge > 99 ? '99+' : badge}
              </div>
            </div>
          )}
        </Box>
      </button>
      <Tooltip
        id={tooltipId}
        place={'bottom'}
        variant={'dark'}
        delayShow={500}
        className={styles.tooltip}
      >
        {tooltipText}
      </Tooltip>
    </div>
  );
};

export default GlobalActionButton;
