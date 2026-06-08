import type { VariantProps } from 'class-variance-authority';
import type React from 'react';

import { cn } from '../../lib/utils';
import { Icon, type IconProps } from '../icon';
import { alertVariants } from './variants';

function Alert({
  variant = 'active',
  size = 'md',
  className,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot={'alert'}
      role={'alert'}
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function AlertInfo({ className, ...props }: Omit<IconProps, 'name'>) {
  return (
    <Icon
      name={'info-circle'}
      size={'sm'}
      className={cn(className)}
      {...props}
    />
  );
}

function AlertHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'alert-header'}
      className={cn('flex gap-1 items-center', className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'alert-title'}
      className={cn('font-medium text-primary', className)}
      {...props}
    />
  );
}

function AlertSubtitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot={'alert-subtitle'}
      className={cn('text-lg font-medium', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot={'alert-description'}
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

export {
  Alert,
  AlertDescription,
  AlertHeader,
  AlertInfo,
  AlertSubtitle,
  AlertTitle,
};
