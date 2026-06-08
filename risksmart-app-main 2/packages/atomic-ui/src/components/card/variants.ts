import { cva } from 'class-variance-authority';

const variant = {
  neutral: 'border-neutral-border',
  secondary: 'border-secondary',
  success: 'border-success',
  warning: 'border-warning',
  destructive: 'border-destructive',
};

const headerVariant = {
  neutral: 'bg-muted-minimal',
  secondary: 'bg-secondary-minimal',
  success: 'bg-success-minimal',
  warning: 'bg-warning-minimal',
  destructive: 'bg-destructive-minimal',
};

export const cardVariants = cva(
  'bg-neutral text-neutral-foreground border border-solid overflow-hidden shadow rounded-xl flex grow flex-col gap-4 transition-colors duration-300 [&_[data-slot=switch]]:cursor-default',
  {
    variants: {
      variant,
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export const cardHeaderVariants = cva(
  'p-4 gap-2 rounded-t-xl group-data-[size=sm]/card:px-4 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
  {
    variants: {
      variant: headerVariant,
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);
