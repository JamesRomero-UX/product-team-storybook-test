import type { FC, ReactNode } from 'react';

interface Props {
  isActive?: boolean;
  badge?: boolean;
  count: number | undefined;
}

export type CountRenderer = (props: {
  countName: string;
  isActive: boolean;
  badge?: boolean;
}) => ReactNode;

const Count: FC<Props> = ({ isActive, badge, count }) => {
  if (typeof count !== 'number') {
    return;
  }
  const isEmpty = count === 0 || count === undefined;

  if (badge) {
    if (isEmpty) {
      return;
    }

    return (
      <span
        className={
          'absolute w-[12px] h-[13px] -top-1 -right-1 rounded-full bg-teal text-navy text-center text-[9px] leading-[9px] flex justify-center items-center overflow-hidden'
        }
      >
        {count}
      </span>
    );
  }

  return (
    <span
      className={`px-3 border-2 border-solid rounded-md border-grey600 h-[21px] text-center flex items-center justify-center text-[11px] ${
        isActive && 'bg-teal border-teal text-navy'
      }`}
    >
      {count}
    </span>
  );
};

export default Count;
