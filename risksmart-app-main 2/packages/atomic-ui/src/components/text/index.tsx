import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { textVariants } from './variants';

type Element = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type TextProps = useRender.ComponentProps<'p'> &
  Omit<VariantProps<typeof textVariants>, 'size' | 'weight'> & {
    preset?: 'heading-lg' | 'heading-md' | 'heading-sm' | 'body';
  };

/**
 * A versatile text component that can be rendered as different HTML elements with various sizes and weights.
 * @param className - Additional CSS classes to apply to the text
 * @param preset - A predefined style preset for common text styles (e.g., headings, body)
 * @param render - An optional custom render function for advanced use cases
 * @param props - Any additional props to pass to the underlying HTML element
 *
 * @returns The rendered Text component
 */
export const Text = ({
  className,
  preset = 'body',
  render,
  ...props
}: TextProps) => {
  const element: Record<string, Element> = {
    body: 'p',
    'heading-sm': 'h3',
    'heading-md': 'h2',
    'heading-lg': 'h1',
  };

  return useRender({
    defaultTagName: element[preset],
    props: mergeProps<'p'>(
      {
        className: cn(textVariants({ className, preset })),
      },
      props
    ),
    render,
    state: {
      slot: 'text',
    },
  });
};
