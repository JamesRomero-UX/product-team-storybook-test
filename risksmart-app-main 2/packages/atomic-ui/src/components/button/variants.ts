import { cva } from 'class-variance-authority';

export const variant = {
  default:
    'bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground-hover active:bg-secondary-active active:text-secondary-foreground-active',
  neutral:
    'bg-neutral text-neutral-foreground hover:bg-neutral-hover hover:text-neutral-foreground-hover active:bg-neutral-active active:text-neutral-foreground-active',
  warning: 'bg-warning text-warning-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
};

export const style = {
  default: '',
  outline:
    'bg-transparent border-neutral-border hover:bg-transparent active:bg-transparent border',
  dashed:
    'bg-transparent border-neutral-border hover:bg-transparent active:bg-transparent border border-dashed',
  'dashed-fill': 'border-2 border-dashed font-semibold',
  ghost:
    'bg-transparent hover:bg-transparent active:bg-transparent rounded-none disabled:bg-transparent',
};

export const radius = {
  sm: 'rounded-sm',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const size = {
  sm: 'h-6 gap-2 px-2 py-2 text-sm',
  md: 'h-10 gap-2 px-5 py-2 text-lg',
  icon: 'size-10 p-2',
};

export const elevated = {
  true: 'transition-all duration-200 ease-out hover:scale-[1.005] hover:shadow',
  false: '',
};

export const buttonVariants = cva(
  "hover:cursor-pointer rounded-full border border-transparent bg-clip-padding text-xs/relaxed font-bold focus-visible:ring-[2px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:border-none shrink-0 [&_svg]:shrink-0 group/button select-none",
  {
    variants: {
      variant,
      style,
      radius,
      size,
      elevated,
    },
    defaultVariants: {
      variant: 'default',
      style: 'default',
      radius: 'full',
      size: 'md',
      elevated: false,
    },
    compoundVariants: [
      {
        variant: 'default',
        style: 'outline',
        class:
          'text-secondary hover:bg-secondary-minimal active:bg-secondary-minimal hover:text-secondary-hover active:text-secondary-hover hover:border-secondary active:border-secondary',
      },
      {
        variant: 'default',
        style: 'dashed',
        class:
          'text-secondary hover:bg-secondary-minimal active:bg-secondary-minimal hover:text-secondary-hover active:text-secondary-hover hover:border-secondary active:border-secondary',
      },
      {
        variant: 'default',
        style: 'dashed-fill',
        class:
          'border-secondary bg-secondary-minimal text-secondary hover:text-secondary-hover hover:bg-secondary-minimal hover:border-secondary-hover active:bg-secondary-minimal active:text-secondary-hover active:border-secondary-hover',
      },
      {
        variant: 'default',
        style: 'ghost',
        class:
          'text-secondary hover:text-secondary-hover active:text-secondary-hover',
      },
      {
        variant: 'neutral',
        style: 'outline',
        class:
          'hover:bg-neutral-hover hover:text-neutral-foreground-hover active:bg-neutral-active active:text-neutral-foreground-active',
      },
      {
        variant: 'neutral',
        style: 'dashed',
        class:
          'hover:bg-neutral-hover hover:text-neutral-foreground-hover active:bg-neutral-active active:text-neutral-foreground-active',
      },
      {
        variant: 'neutral',
        style: 'dashed-fill',
        class:
          'border-muted-foreground bg-muted-minimal text-muted-foreground hover:text-muted-foreground-hover hover:bg-muted-minimal hover:border-foreground-hover active:bg-muted-minimal active:text-muted-foreground-hover active:border-foreground-hover',
      },
      {
        variant: 'destructive',
        style: 'outline',
        class:
          'text-destructive hover:bg-destructive-minimal active:bg-destructive-minimal hover:text-destructive-hover active:text-destructive-hover hover:border-destructive active:border-destructive',
      },
      {
        variant: 'destructive',
        style: 'dashed',
        class:
          'text-destructive hover:bg-destructive-minimal active:bg-destructive-minimal hover:text-destructive-hover active:text-destructive-hover hover:border-destructive active:border-destructive',
      },
      {
        variant: 'destructive',
        style: 'dashed-fill',
        class:
          'border-destructive bg-destructive-minimal text-destructive hover:text-destructive-hover hover:bg-destructive-minimal hover:border-foreground-hover active:bg-destructive-minimal active:text-destructive-hover active:border-destructive-hover',
      },
      {
        variant: 'destructive',
        style: 'ghost',
        class:
          'text-destructive hover:text-destructive-hover active:text-destructive-hover',
      },
      {
        variant: 'warning',
        style: 'outline',
        class:
          'text-warning hover:bg-warning-minimal active:bg-warning-minimal hover:border-warning active:border-warning',
      },
      {
        variant: 'warning',
        style: 'dashed',
        class:
          'text-warning hover:bg-warning-minimal active:bg-warning-minimal hover:border-warning active:border-warning',
      },
      {
        variant: 'warning',
        style: 'dashed-fill',
        class:
          'border-warning bg-warning-minimal text-warning hover:text-warning-hover hover:bg-warning-minimal hover:border-foreground-hover active:bg-warning-minimal active:text-warning-hover active:border-warning-hover',
      },
      {
        variant: 'warning',
        style: 'ghost',
        class: 'text-warning',
      },
      {
        radius: 'sm',
        size: 'icon',
        class: 'size-8',
      },
    ],
  }
);
