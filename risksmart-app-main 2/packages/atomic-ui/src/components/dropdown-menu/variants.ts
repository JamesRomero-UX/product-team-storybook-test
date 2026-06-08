import { cva } from 'class-variance-authority';

export const itemVariant = {
  default:
    'text-primary [&_svg]:text-muted-foreground [&:hover_svg]:text-primary-hover [&[data-highlighted]_svg]:text-primary-hover hover:bg-muted data-[highlighted]:bg-muted',
  destructive:
    'text-destructive hover:text-destructive-hover hover:bg-destructive-minimal data-[highlighted]:bg-destructive-minimal',
};

export const dropdownMenuContentVariants = cva(
  [
    'bg-neutral border border-muted rounded-lg p-[5px] shadow min-w-[220px] overflow-hidden',
    // Animation classes
    'origin-[var(--transform-origin)] max-h-[var(--available-height)] overflow-y-auto transition-[opacity,transform] duration-150 ease-out data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
  ].join(' ')
);

export const dropdownMenuItemVariants = cva(
  'flex items-center gap-2 rounded-md px-2 py-1.5 text-lg outline-none select-none cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: itemVariant,
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const dropdownMenuSeparatorVariants = cva(
  'bg-muted -mx-px my-[3px] h-px'
);

export const dropdownMenuLabelVariants = cva(
  'text-muted-foreground px-2 py-1.5 text-sm font-semibold'
);
