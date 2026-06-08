import { X } from '@untitled-ui/icons-react';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';

export type Token = {
  value: string;
  url?: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  subtitle?: string;
};

import Button from '@risksmart-app/components/src/button';
import { useTranslation } from 'react-i18next';

import Link from '../link';

export type Props = {
  tokens: Token[];
  onRemove: (value: string) => void;
  disabled?: boolean;
  limit?: number;
};

const Tokens: FC<Props> = ({ tokens, onRemove, disabled, limit }) => {
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();

  return (
    <div className={'flex flex-wrap gap-y-3 gap-x-3 mt-3'}>
      {tokens.slice(0, showMore ? undefined : limit).map((option, index) => {
        return (
          <span
            key={`${option.value}-option-${index}`}
            className={`px-5 bg-grey150 text-grey650 rounded-full h-[33px] align-center items-stretch ${
              !disabled && !option.disabled ? 'pr-3' : ''
            }`}
          >
            <span className={'flex space-x-1 items-center  h-full gap-2'}>
              <span
                className={
                  'text-[13px] leading-none font-semibold flex flex-col'
                }
              >
                <span>
                  {option.url ? (
                    <Link
                      color={'normal'}
                      fontSize={'body-s'}
                      href={option.url}
                    >
                      {option.label}
                    </Link>
                  ) : (
                    option.label
                  )}
                  {option.subtitle && (
                    <span
                      className={
                        'text-[11px] text-grey500 font-normal leading-tight pl-2'
                      }
                    >
                      {option.subtitle}
                    </span>
                  )}
                </span>
              </span>
              {option.icon && (
                <span className={'border-none p-[0] m-[0] align-middle flex'}>
                  {option.icon}
                </span>
              )}
              {!disabled && !option.disabled && (
                <button
                  aria-label={`remove ${option.label}`}
                  className={
                    'border-none p-[0] m-[0] align-middle flex cursor-pointer'
                  }
                  onClick={() => onRemove(option.value)}
                >
                  <X className={'text-grey650'} />
                </button>
              )}
            </span>
          </span>
        );
      })}
      {limit && tokens.length > limit && (
        <Button variant={'link'} onClick={() => setShowMore(!showMore)}>
          {showMore ? t('tokens.showFewer') : t('tokens.showMore')}
        </Button>
      )}
    </div>
  );
};

export default Tokens;
