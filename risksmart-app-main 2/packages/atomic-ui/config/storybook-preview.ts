import { withThemeByClassName } from '@storybook/addon-themes';
import type { Decorator, Preview, ReactRenderer } from '@storybook/react-vite';

export function createStorybookPreview(options?: { decorators?: Decorator[] }) {
  return {
    decorators: [
      ...(options?.decorators ?? []),
      withThemeByClassName<ReactRenderer>({
        themes: {
          risksmart: '',
          fire: 'atomic-ui-fire',
        },
        defaultTheme: 'risksmart',
        parentSelector: 'body',
      }),
    ],
    tags: ['autodocs'],
    initialGlobals: {
      a11y: {
        manual: true,
      },
    },
  } satisfies Preview;
}
