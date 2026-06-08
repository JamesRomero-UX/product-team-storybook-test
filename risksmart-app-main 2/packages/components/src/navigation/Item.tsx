import type { ReactNode } from 'react';

export const Item = (props: { children: ReactNode }) => (
  <li className={'list-none px-4 py-1'}>{props.children}</li>
);
