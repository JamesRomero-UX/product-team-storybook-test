import type { FC } from 'react';

interface Props {
  isActive?: boolean;
  index: number;
  length: number;
}

const RadioButton: FC<Props> = ({ isActive, index, length }) => {
  const lineStyles =
    'flex relative border-[1px] h-[18px] border-grey600 border-solid';

  const first = index === 0;
  const last = index === length - 1;

  return (
    <div className={`flex w-[20px] justify-center items-center`}>
      <div
        className={`size-[11px] flex items-center justify-center bg-navy rounded-full border-2 border-grey600 border-solid z-10 ${
          isActive ? 'bg-teal border-teal' : ''
        }`}
      />
      <div className={'group flex flex-col relative z-0 -left-1/2'}>
        <div
          className={`${lineStyles} bottom-1/2 ${first ? 'invisible' : ''}`}
        />
        <div className={`${lineStyles} top-1/2 ${last ? 'invisible' : ''}`} />
      </div>
    </div>
  );
};

export default RadioButton;
