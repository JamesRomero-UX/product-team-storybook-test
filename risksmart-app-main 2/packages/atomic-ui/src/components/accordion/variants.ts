import { cva } from 'class-variance-authority';

export const accordionItemVariants = cva(
  'bg-neutral overflow-hidden rounded-xl border border-neutral-border data-[open]:bg-neutral',
  {
    variants: {
      variant: {
        default: '',
        card: '',
        inverse: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const accordionTriggerVariants = cva(
  '[&_[data-slot=accordion-trigger-icon]]:text-muted-foreground gap-6 p-4 text-primary text-left text-lg font-bold [&_[data-slot=accordion-trigger-icon]]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between transition-all outline-none hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-muted-minimal [&_[data-slot=accordion-trigger-icon]]:ml-auto',
        card: 'bg-neutral [&_[data-slot=accordion-trigger-icon]]:ml-auto',
        inverse: 'bg-neutral [&_[data-slot=accordion-trigger-icon]]:ml-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const accordionSwitchTriggerVariants = cva(
  'gap-6 p-4 text-primary text-left text-lg font-bold pointer-events-none relative flex flex-1 items-center justify-between transition-all outline-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-muted-minimal',
        card: 'bg-neutral',
        inverse: 'bg-neutral',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const accordionHeaderVariants = cva('flex m-0 border-neutral-border', {
  variants: {
    variant: {
      default: 'data-[open]:border-b',
      card: '',
      inverse: 'data-[open]:border-b',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const accordionContentVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-neutral',
      card: 'bg-neutral',
      inverse: 'bg-muted-minimal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
