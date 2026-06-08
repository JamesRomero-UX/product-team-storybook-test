import { cva } from 'class-variance-authority';

export const variant = {
  active: [
    'border-secondary',
    '[&_[data-slot=alert-subtitle]]:text-secondary',
    '[&>[data-slot=alert-description]]:text-muted-foreground',
    '[&>svg]:text-secondary',
  ].join(' '),
  inactive: [
    '[&_[data-slot=alert-subtitle]]:text-secondary',
    '[&>[data-slot=alert-description]]:text-muted-foreground',
    '[&>svg]:text-muted-foreground',
  ].join(' '),
  warning: [
    'bg-warning-minimal border-warning',
    '[&_[data-slot=alert-subtitle]]:text-warning',
    '[&>[data-slot=alert-description]]:text-warning',
    '[&>svg]:text-warning',
  ].join(' '),
  error: [
    'bg-destructive-minimal border-destructive',
    '[&_[data-slot=alert-subtitle]]:text-destructive',
    '[&>[data-slot=alert-description]]:text-destructive',
    '[&>svg]:text-destructive',
  ].join(' '),
};

export const size = {
  md: '[&_[data-slot=alert-title]]:text-lg p-4 gap-x-3.5 rounded-xl',
  sm: '[&_[data-slot=alert-title]]:text-base px-3 py-2.5 gap-x-2.5 rounded-lg',
};

export const alertVariants = cva(
  [
    'bg-neutral text-neutral-foreground border border-solid border-neutral-border overflow-hidden shadow',
    'grid content-center',
    'has-[[data-slot=alert-status]]:grid-cols-[auto_1fr]',
    '[&>[data-slot=alert-status]]:row-span-2 [&>[data-slot=alert-status]]:self-center',
    'has-[>svg]:grid-cols-[auto_1fr]',
    '[&>svg]:row-span-2 [&>svg]:self-center',
    '[&>[data-slot=alert-description]]:mt-0.5',
  ].join(' '),
  {
    variants: {
      variant,
      size,
    },
    defaultVariants: {
      variant: 'active',
      size: 'md',
    },
    compoundVariants: [
      {
        variant: 'active',
        size: 'sm',
        class: 'bg-secondary-minimal',
      },
    ],
  }
);
