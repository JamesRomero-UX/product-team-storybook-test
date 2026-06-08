import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../../lib/utils';
import { cardHeaderVariants, cardVariants } from './variants';

function Card({
  className,
  size = 'default',
  variant = 'neutral',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' } & VariantProps<
    typeof cardVariants
  >) {
  return (
    <div
      data-slot={'card'}
      data-size={size}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({
  className,
  variant = 'neutral',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardHeaderVariants>) {
  return (
    <div
      data-slot={'card-header'}
      className={cn(cardHeaderVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'card-title'}
      className={cn('text-base font-medium', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'card-description'}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'card-action'}
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'card-content'}
      className={cn(
        'py-4 px-6 group-data-[size=sm]/card:px-4 text-base',
        className
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'card-footer'}
      className={cn(
        'grid grid-cols-[auto_1fr] items-center gap-2 [&:has([data-slot=switch])]:grid-cols-[auto_1fr_auto] text-base px-4 pb-4',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
