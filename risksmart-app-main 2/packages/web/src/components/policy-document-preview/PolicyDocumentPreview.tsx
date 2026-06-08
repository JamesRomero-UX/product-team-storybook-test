import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import Button from '@risksmart-app/components/src/button';
import { downloadBlob } from '@risksmart-app/components/src/file/fileUtils';
import parse from 'html-react-parser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import Loading from 'src/components/loading';

import type { PublicDocumentData } from '../../pages/files/config';

type Props = {
  data: PublicDocumentData;
};

export const PolicyDocumentPreview = ({ data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation('common', { keyPrefix: 'policy' });
  const [pdfError, setPdfError] = useState(false);

  const pdfLink = useMemo(() => {
    if (data.type !== 'file' || !data.blob) {
      return;
    }

    return URL.createObjectURL(data.blob);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkIframeContentForPlaceholder = (
    iframeEl: HTMLIFrameElement | null
  ): boolean => {
    if (!iframeEl) {
      return false;
    }

    try {
      const doc = iframeEl.contentDocument;
      if (!doc) {
        return true; // Unable to access document, assume error
      }

      // Check 1A: Standard 'open-button' ID
      if (doc.getElementById('open-button')) {
        return true;
      }

      // Check 1B: Standard 'sub-frame-error-details' ID
      if (doc.getElementById('sub-frame-error-details')) {
        return true;
      }

      // Check 2: Fallback for Chrome placeholder structure (body class and h1 content)
      if (pdfLink) {
        // pdfLink is from the component's scope
        const h1 = doc.querySelector('h1');
        const blobUrlUuid = pdfLink.substring(pdfLink.lastIndexOf('/') + 1);
        if (
          doc.body &&
          doc.body.classList.contains('pdf') &&
          h1 &&
          h1.textContent === blobUrlUuid
        ) {
          return true;
        }
      }

      return false; // No definitive signs of the placeholder found
    } catch (_e) {
      // Error accessing iframe content (e.g. security), assume PDF display error
      return true;
    }
  };

  const previewBody = () => {
    switch (data.type) {
      case 'html':
        return (
          <TextContent>
            {parse(sanitizeHtml(data.documentFile.Content ?? ''))}
          </TextContent>
        );
      case 'file':
        return !data.blob ? (
          <Loading />
        ) : data.documentFile.file?.FileName.toLowerCase()
            .trim()
            .endsWith('.pdf') ? (
          <div data-testid={'pdf-viewer'}>
            {!pdfError ? (
              <iframe
                className={'w-full min-h-[800px]'}
                src={pdfLink}
                onError={() => setPdfError(true)}
                onLoad={(e) => {
                  const currentIframe = e.currentTarget;
                  if (checkIframeContentForPlaceholder(currentIframe)) {
                    setPdfError(true);

                    return;
                  }

                  timeoutRef.current = setTimeout(() => {
                    if (checkIframeContentForPlaceholder(currentIframe)) {
                      setPdfError(true);
                    }
                  }, 300); // 300ms delay
                }}
              />
            ) : (
              <div
                className={
                  'flex justify-center items-center flex-col text-center mb-4'
                }
              >
                <h2 className={'mb-2'}>
                  {t('publicFile.errorTitle', 'Cannot display PDF')}
                </h2>
                <p>
                  {t(
                    'publicFile.errorBody',
                    'Your browser cannot display this PDF. Please download to view it.'
                  )}
                </p>
                <Button
                  onClick={() =>
                    data.blob &&
                    downloadBlob(
                      data.documentFile.file?.FileName ?? 'file',
                      data.blob
                    )
                  }
                >
                  {t('publicFile.button')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={
              'flex justify-center items-center flex-col text-center mb-4'
            }
          >
            <h2 className={'mb-2'}>{t('publicFile.title')}</h2>
            <p>{t('publicFile.body')}</p>
            <Button
              onClick={() =>
                data.blob &&
                downloadBlob(
                  data.documentFile.file?.FileName ?? 'file',
                  data.blob
                )
              }
            >
              {t('publicFile.button')}
            </Button>
          </div>
        );
      case 'link':
        return (
          <div
            className={
              'flex justify-center items-center flex-col text-center mb-4'
            }
          >
            <h2 className={'mb-2'}>{t('publicLink.title')}</h2>
            <p>{t('publicLink.body')}</p>
            <Button onClick={() => window.open(data.link, '_blank')}>
              {t('publicLink.button')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div ref={containerRef}>{previewBody()}</div>;
};
