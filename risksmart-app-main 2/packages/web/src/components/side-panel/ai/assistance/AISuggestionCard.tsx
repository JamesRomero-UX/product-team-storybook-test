import { Clock } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC, MouseEvent, MutableRefObject, ReactNode } from 'react';
import { useRef, useState } from 'react';

export type CheckedColour = 'teal' | 'magenta';

interface AISuggestionCardProps {
  id: string;
  tags: ReactNode[];
  title: string;
  subtitle?: string;
  description: string;
  date: string;
  createdBy: string;
  onCheckedChanged: (id: string, checked: boolean) => void;
  checkedColour: CheckedColour;
  //no-dd-sa
  disabled: boolean;
}

export const AISuggestionCard: FC<AISuggestionCardProps> = ({
  id,
  tags,
  title,
  subtitle,
  description,
  date,
  createdBy,
  onCheckedChanged,
  checkedColour,
  disabled,
}) => {
  const [checked, setChecked] = useState(false);
  const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  function toggle(): void {
    if (!disabled) {
      inputRef.current!.checked = !inputRef.current!.checked;
      setChecked(inputRef.current!.checked);

      onCheckedChanged(id, inputRef.current!.checked);
    }
  }

  function inputClicked(event: MouseEvent<HTMLInputElement>): void {
    onCheckedChanged(id, inputRef.current!.checked);

    setChecked(inputRef.current!.checked);

    event.stopPropagation();
  }

  return (
    <li
      className={clsx(
        'p-5 mb-5 border-1 border-solid rounded-lg',
        !checked && 'border-grey200',
        checked && `border-${checkedColour}`,
        !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed'
      )}
      key={id}
      onClick={toggle}
    >
      <div className={'flex flex-row justify-between'}>
        <input
          type={'checkbox'}
          name={'suggestedItems'}
          aria-labelledby={title}
          id={id}
          className={clsx(
            'h-[20px] w-[20px] disabled:cursor-not-allowed',
            `accent-${checkedColour}`
          )}
          ref={inputRef}
          onClick={inputClicked}
          disabled={disabled}
        />
        <div className={'flex flex-row'}>{tags}</div>
      </div>
      <div>
        <label
          className={'inline-block mt-6 mb-0 font-bold text-lg cursor-pointer'}
          role={'heading'}
        >
          {title}
        </label>
        {subtitle && (
          <h5 className={'my-2 text-grey800 normal font-normal'}>{subtitle}</h5>
        )}
        <p className={'text-grey800'}>{description}</p>
        <div className={'flex flex-row items-center text-grey300'}>
          <Clock width={'1em'}></Clock>
          <span className={'ml-2'}>{date}</span>
          <span className={'ml-2'}>{'-'}</span>
          <span className={'ml-2'}>
            {'Created by '}
            {createdBy}
          </span>
        </div>
      </div>
    </li>
  );
};
