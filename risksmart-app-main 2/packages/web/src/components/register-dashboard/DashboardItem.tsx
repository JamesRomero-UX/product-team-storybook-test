import clsx from 'clsx';
import { type FC, useMemo } from 'react';
import useGetPopoverWrappedContent from 'src/components/popover-footer/hooks/useGetPopoverWrappedContent';

export type DashboardItemProps = {
  title: string;
  value: number;
  selected?: boolean;
  onClick?: () => void;
  noClickthroughMessageContent?: string;
};

export const DashboardItem: FC<DashboardItemProps> = ({
  title,
  value,
  selected,
  onClick,
  noClickthroughMessageContent,
}) => {
  const color = useMemo(() => {
    if (!onClick) {
      return 'text-grey';
    }

    return selected ? 'text-navy_mid' : 'text-teal';
  }, [onClick, selected]);

  const getContent = useGetPopoverWrappedContent(
    onClick,
    noClickthroughMessageContent
  );

  return (
    <button
      data-testid={'dashboard-item'}
      disabled={selected}
      className={
        'group flex w-full h-full mr-[20px] min-w-[150px] flex-grow border-none bg-transparent p-[10px] m-0 text-start cursor-pointer disabled:cursor-default disabled:text-navy_mid'
      }
      onClick={onClick}
    >
      <div className={'flex flex-col gap-y-4'}>
        <h5
          className={
            'm-0 truncate max-w-[200px] text-[14px] font-semibold text-navy_mid'
          }
        >
          {title}
        </h5>
        {getContent(
          <h1
            className={clsx(
              `m-0 w-max text-5xl transition-all duration-200 group-enabled:group-hover:scale-[108%] group-enabled:group-active:scale-[92%] font-bold ${color}`,
              { 'group-enabled:group-hover:text-teal2': onClick }
            )}
          >
            {value}
          </h1>
        )}
      </div>
    </button>
  );
};
