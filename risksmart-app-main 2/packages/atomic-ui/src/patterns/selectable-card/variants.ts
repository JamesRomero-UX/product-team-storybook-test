import { cva } from 'class-variance-authority';

export const selectableCardVariants = cva(
  'bg-neutral text-neutral-foreground border border-solid border-neutral-border overflow-hidden shadow rounded-xl p-4 flex grow flex-col gap-4 transition-colors duration-300 [&_[data-slot=switch]]:cursor-default',
  {
    variants: {
      enabled: {
        true: [
          'cursor-pointer',
          '[&_[data-slot=selectable-card-status]]:text-secondary-foreground',
        ].join(' '),
        false: [
          'cursor-not-allowed',
          '[&_[data-slot=selectable-card-status]]:text-muted-foreground',
        ].join(' '),
      },
      selected: {
        true: 'border-secondary',
        false: '',
      },
    },
    defaultVariants: {
      enabled: false,
      selected: false,
    },
  }
);
