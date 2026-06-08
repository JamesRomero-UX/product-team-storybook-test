import { cva } from 'class-variance-authority';

export const size = {
  sm: [
    'flex-col justify-center text-center gap-1 h-[46px] py-2.5',
    '[&_[data-slot=rating-item-content]]:items-center',
    '[&_[data-slot=rating-item-title]]:text-sm',
    '[&_[data-slot=rating-item-title]]:font-semibold',
    '[&_[data-slot=rating-item-description]]:text-sm',
    '[&_[data-slot=rating-item-description]]:font-semibold',
  ].join(' '),
  md: '',
};

export const ratingItemVariants = cva(
  'group flex w-full items-center justify-between rounded-xl px-3.5 py-2 gap-4 h-[60px] transition-all duration-200 ease-out has-[[data-slot=rating-item-badge]]:px-2.5',
  {
    variants: {
      size,
      interactive: {
        true: 'cursor-pointer hover:opacity-90 hover:shadow',
        false: 'cursor-default',
      },
    },
    compoundVariants: [
      { size: 'md', interactive: true, class: 'hover:scale-[1.005]' },
    ],
    defaultVariants: {
      size: 'md',
      interactive: false,
    },
  }
);
