import { Check, Link04, X } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import styles from '../style.module.scss';
import { copyCurrentPageUrl } from './utils/clipboard';

interface CopyLinkButtonProps {
  tooltipId?: string;
  disabled?: boolean;
}

export const CopyLinkButton: FC<CopyLinkButtonProps> = ({
  tooltipId = 'breadcrumb-copy-link',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleLinkClick = async () => {
    const timeout = 2500;
    const result = await copyCurrentPageUrl();

    if (result?.error) {
      setCopyError(result?.error);

      setTimeout(() => {
        setCopyError(null);
      }, timeout);

      return;
    }

    if (result) {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }
  };

  return (
    <>
      <button
        onClick={handleLinkClick}
        disabled={disabled || isCopied || !!copyError}
        className={
          'flex items-center justify-center ' +
          'bg-transparent border-none enabled:cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none p-0 ' +
          'transition opacity-80 enabled:hover:opacity-100 enabled:active:scale-90'
        }
        aria-label={isCopied ? t('linkCopied') : t('copyPageLink')}
        data-tooltip-id={tooltipId}
      >
        {copyError ? (
          <X className={`size-3.5 text-red`} />
        ) : isCopied ? (
          <Check className={`size-3.5 text-teal`} />
        ) : (
          <Link04 className={`size-3.5 text-white`} />
        )}
      </button>

      <Tooltip
        id={tooltipId}
        place={'bottom-start'}
        variant={'dark'}
        delayShow={500}
        className={styles.tooltip}
      >
        {copyError
          ? t('linkCopyError')
          : isCopied
            ? t('linkCopied')
            : t('copyPageLink')}
      </Tooltip>
    </>
  );
};
