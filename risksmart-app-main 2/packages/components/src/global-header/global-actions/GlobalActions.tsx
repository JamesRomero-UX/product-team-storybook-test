import type { FC, ReactNode } from 'react';
import { Children } from 'react';

interface Props {
  children?: ReactNode;
}

export const GlobalActions: FC<Props> = ({ children }) => {
  const childrenArray = Children.toArray(children);
  const dividedChildren = childrenArray.map((child, index) => {
    if (index === 0) {
      return child;
    }

    return (
      <div key={index} className={'flex items-center'}>
        <div className={'flex h-full w-[1px] bg-grey500'} />
        {child}
      </div>
    );
  });

  return <div className={'flex h-full'}>{dividedChildren}</div>;
};
