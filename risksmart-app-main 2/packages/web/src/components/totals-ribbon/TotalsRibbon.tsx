import type { FC } from 'react';

type Item = {
  label: string;
  value: string;
};

type Props = {
  items: Item[];
};

const TotalsRibbon: FC<Props> = ({ items }) => {
  return (
    <div
      className={
        'border-grey250 border-solid rounded-[10px] py-4 border-[1.5px] mb-3'
      }
    >
      <div
        className={
          'flex divide-x-[1.5px] divide-y-0  divide-grey250 border-0 divide-solid'
        }
      >
        {items.map((option) => (
          <div key={option.label} className={'py-1 px-5 flex-grow'}>
            <div className={'font-semibold text-sm'}>{option.label}</div>
            <div className={'font-bold text-2xl'}>{option.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalsRibbon;
