import { DotsHorizontal } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

export type Props = {
  tokens: string[];
};

const isWrapping = (previous: Element, current: Element) =>
  previous.getBoundingClientRect().top !== current.getBoundingClientRect().top;

const getIndexOfFirstWrappedItem = (container: Element): null | number => {
  for (let i = 1; i < container.children.length; ++i) {
    const previous = container.children[i - 1];
    const current = container.children[i];

    if (isWrapping(previous, current)) {
      return i;
    }
  }

  return null;
};

const CardTokens: FC<Props> = ({ tokens }) => {
  const [showMore, setShowMore] = useState(false);
  const [limit, setLimit] = useState(100);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const wrappingIndex = getIndexOfFirstWrappedItem(ref.current);
      if (wrappingIndex) {
        // Only show 1 line of tokens
        setLimit(wrappingIndex - 1);
      }
    }
  }, [tokens]);

  return (
    <div className={'flex flex-wrap gap-y-3 gap-x-3 mt-3'} ref={ref}>
      {tokens.slice(0, showMore ? undefined : limit).map((token, index) => {
        return (
          <span
            key={index}
            className={
              'px-3 py-1 bg-grey150 text-grey650 rounded-full align-center items-stretch'
            }
          >
            {token}
          </span>
        );
      })}
      {limit && tokens.length > limit && !showMore && (
        <button
          className={
            'rounded-full flex items-center h-7 bg-grey150 text-grey650 border-none'
          }
          onClick={() => setShowMore(!showMore)}
        >
          <DotsHorizontal />
        </button>
      )}
    </div>
  );
};

export default CardTokens;
