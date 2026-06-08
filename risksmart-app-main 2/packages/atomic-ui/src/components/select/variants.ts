import { cva } from 'class-variance-authority';

export const selectTriggerVariants = cva(
  [
    'flex h-[34px] w-full items-center justify-between rounded-lg border bg-primary-foreground px-3 py-2 text-lg text-primary outline-none',
    'focus-visible:border-secondary hover:cursor-pointer',
    'disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:border-muted',
  ].join(' '),
  {
    variants: {
      invalid: {
        true: 'border-destructive text-destructive pl-[calc(0.75rem+4px)] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-destructive',
        false: 'border-neutral-border',
      },
    },
    defaultVariants: {
      invalid: false,
    },
  }
);

export const selectPopupVariants = cva(
  [
    'max-h-[300px] w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-neutral-border bg-primary-foreground p-1 shadow-lg',
    'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-150',
  ].join(' ')
);

export const selectItemVariants = cva(
  [
    'flex w-full justify-between cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-lg text-primary outline-none select-none',
    'data-[highlighted]:bg-muted',
    'data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground',
  ].join(' ')
);

export const selectGroupLabelVariants = cva(
  'px-2 py-1.5 text-sm font-semibold text-muted-foreground'
);
