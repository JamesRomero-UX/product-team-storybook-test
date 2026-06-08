import { cva } from 'class-variance-authority';

type Element = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export const elementPreset: Record<string, Element> = {
  body: 'p',
  'heading-sm': 'h3',
  'heading-md': 'h2',
  'heading-lg': 'h1',
};

export const preset = {
  body: 'text-base font-normal',
  'heading-sm': 'text-2xl font-semibold',
  'heading-md': 'text 3xl font-bold',
  'heading-lg': 'text 5xl font-extrabold',
};

export const textVariants = cva('m-0 p-0', {
  variants: {
    preset,
  },
  defaultVariants: {
    preset: 'body',
  },
});
