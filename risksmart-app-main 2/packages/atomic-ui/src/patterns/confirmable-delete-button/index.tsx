import { type MouseEvent, useRef, useState } from 'react';

import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { cn } from '../../lib/utils';

const CONFIRM_AUTO_DISMISS_MS = 3000;

export interface ConfirmableDeleteButtonProps {
  /** Callback fired when the user confirms deletion */
  onConfirm: () => void;
  /** Button size — controls the trash/x icon button sizing */
  size?: 'sm' | 'icon';
  /** When true, the trash icon is hidden until the nearest `group-hover` ancestor is hovered */
  showOnGroupHover?: boolean;
  /** CSS group name for the hover selector (e.g. `'field-card'` → `group-hover/field-card:`) */
  groupName?: string;
  /** Accessible label for the trash button */
  'aria-label'?: string;
  className?: string;
}

export const ConfirmableDeleteButton = ({
  onConfirm,
  size = 'icon',
  showOnGroupHover = false,
  groupName,
  'aria-label': ariaLabel = 'Delete',
  className,
}: ConfirmableDeleteButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
    }
  };

  const dismiss = () => {
    clearTimers();
    setConfirming(false);
  };

  const handleTrashClick = (e: MouseEvent) => {
    e.stopPropagation();
    clearTimers();
    setConfirming(true);
    autoDismissRef.current = setTimeout(dismiss, CONFIRM_AUTO_DISMISS_MS);
  };

  const handleConfirm = (e: MouseEvent) => {
    e.stopPropagation();
    clearTimers();
    setConfirming(false);
    onConfirm();
  };

  const handleCancel = (e: MouseEvent) => {
    e.stopPropagation();
    dismiss();
  };

  const hoverClass =
    showOnGroupHover && groupName
      ? `opacity-0 group-hover/${groupName}:opacity-100`
      : showOnGroupHover
        ? 'opacity-0 group-hover:opacity-100'
        : '';

  return (
    <div
      data-slot={'confirmable-delete-button'}
      className={cn('flex items-center', className)}
    >
      {/* Delete button slides in from the right */}
      <div
        aria-hidden={!confirming}
        className={cn(
          'relative overflow-hidden transition-all ease-out duration-300',
          confirming ? 'max-w-[80px] opacity-100 mr-1' : 'max-w-0 opacity-0'
        )}
      >
        <Button
          variant={'destructive'}
          size={'sm'}
          className={cn('whitespace-nowrap')}
          onClick={handleConfirm}
        >
          {'Delete'}
        </Button>
        {/* Gradient overlay to smooth the exit transition */}
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 w-8 transition-opacity duration-75',
            confirming ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            background:
              'linear-gradient(to right, transparent, oklch(var(--neutral)))',
          }}
        />
      </div>
      {/* Trash / X icon — ternary swap in the same position */}
      {confirming ? (
        <Button
          variant={'neutral'}
          style={'ghost'}
          size={size}
          aria-label={'Cancel delete'}
          className={cn(
            'p-0',
            size === 'icon' ? 'size-auto' : 'whitespace-nowrap'
          )}
          onClick={handleCancel}
        >
          <Icon name={'x'} size={'sm'} className={'animate-spin-in'} />
        </Button>
      ) : (
        <Button
          variant={'destructive'}
          style={'ghost'}
          size={size}
          className={cn(
            'transition-opacity p-0',
            size === 'icon' && 'size-auto',
            hoverClass
          )}
          aria-label={ariaLabel}
          onClick={handleTrashClick}
        >
          <Icon name={'trash-2'} size={'sm'} />
        </Button>
      )}
    </div>
  );
};
