import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps, MouseEvent } from 'react';

import { cn, getAccessibleTextColor } from '../../lib/utils';
import { ratingItemVariants } from './variants';

type RatingItemProps = ComponentProps<'div'> &
  VariantProps<typeof ratingItemVariants> & {
    color: string;
  };

function RatingItem({
  color,
  size = 'md',
  className,
  onClick,
  ...props
}: RatingItemProps) {
  const textColor = getAccessibleTextColor(color);
  const isInteractive = !!onClick;

  return (
    <div
      data-slot={'rating-item'}
      className={cn(
        ratingItemVariants({ size, interactive: isInteractive }),
        className
      )}
      style={{ backgroundColor: color, color: textColor }}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      {...props}
    />
  );
}

function RatingItemBadge({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'rating-item-badge'}
      className={cn(
        'flex items-center justify-center px-3.5 py-2.5 bg-neutral/30 text-xl font-bold rounded-lg size-10',
        className
      )}
      {...props}
    />
  );
}

function RatingItemContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'rating-item-content'}
      className={cn('flex flex-col justify-center flex-1', className)}
      {...props}
    />
  );
}

function RatingItemTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'rating-item-title'}
      className={cn('text-xl font-bold', className)}
      {...props}
    />
  );
}

function RatingItemDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'rating-item-description'}
      className={cn('text-base font-medium', className)}
      {...props}
    />
  );
}

function RatingItemAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'rating-item-action'}
      className={cn(
        'flex items-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity',
        className
      )}
      {...props}
    />
  );
}

export {
  RatingItem,
  RatingItemAction,
  RatingItemBadge,
  RatingItemContent,
  RatingItemDescription,
  RatingItemTitle,
};
