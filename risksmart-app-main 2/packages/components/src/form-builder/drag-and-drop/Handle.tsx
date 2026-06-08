import Icon from '@risk-smart/themed-cloudscape-components/icon';
import type { HTMLAttributes } from 'react';
import { type CSSProperties, forwardRef } from 'react';

interface ActionProps extends HTMLAttributes<HTMLDivElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
}

export const Handle = forwardRef<HTMLDivElement, ActionProps>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={'flex h-full hover:cursor-grab active:cursor-grabbing'}
    >
      <Icon name={'drag-indicator'} />
    </div>
  );
});

Handle.displayName = 'Handle';
