import type { VariantProps } from 'class-variance-authority';
import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
} from 'react';

import { cn } from '../../lib/utils';
import { selectableCardVariants } from './variants';

function SelectableCard({
  enabled = false,
  selected = false,
  className,
  onClick,
  onKeyDown,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof selectableCardVariants>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (enabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    },
    [enabled, onClick, onKeyDown]
  );

  return (
    <div
      data-slot={'selectable-card'}
      data-testid={'selectable-card'}
      role={enabled ? 'button' : undefined}
      tabIndex={enabled ? 0 : undefined}
      aria-disabled={!enabled || undefined}
      className={cn(selectableCardVariants({ enabled, selected }), className)}
      onClick={enabled ? onClick : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

function SelectableCardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'selectable-card-header'}
      className={cn(
        'gap-0.5 rounded-t-xl grid auto-rows-min items-start [&:has([data-slot="selectable-card-action"])]:grid-cols-[1fr_auto] [&:has([data-slot="selectable-card-description"])]:grid-rows-[auto_auto]',
        className
      )}
      {...props}
    />
  );
}

function SelectableCardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'selectable-card-title'}
      className={cn('text-xl font-semibold', className)}
      {...props}
    />
  );
}

function SelectableCardDescription({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'selectable-card-description'}
      className={cn('text-muted-foreground text-base font-medium', className)}
      {...props}
    />
  );
}

function SelectableCardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'selectable-card-action'}
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function SelectableCardFooter({
  className,
  onClick,
  ...props
}: ComponentProps<'div'>) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-slot=switch]')) {
        e.stopPropagation();
      }
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <div
      data-slot={'selectable-card-footer'}
      className={cn(
        'grid grid-cols-[auto_1fr] items-center gap-2 [&:has([data-slot=switch])]:grid-cols-[auto_1fr_auto] h-7',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
}

function SelectableCardStatus({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot={'selectable-card-status'}
      className={cn('text-base font-bold', className)}
      {...props}
    />
  );
}

export {
  SelectableCard,
  SelectableCardAction,
  SelectableCardDescription,
  SelectableCardFooter,
  SelectableCardHeader,
  SelectableCardStatus,
  SelectableCardTitle,
};
