import {
  Alert,
  ContentLayout,
  SpaceBetween,
} from '@risk-smart/themed-cloudscape-components';
import PageHeader from '@risksmart-app/components/src/page-header';
import { handleError } from '@risksmart-app/components/src/utils/errorUtils';
import { ErrorBoundary } from '@sentry/react';
import type { FC, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

import { AuthenticatedAppLayout } from './AuthenticatedAppLayout';

interface Meta {
  /**
   * @description Used to set `window.title` where the page title itself contains sensitive information
   */
  title?: string;
}

interface Props {
  title?: string;
  /**
   * @deprecated Use {@link Props.meta} instead
   */
  pageTitle?: string;
  meta?: Meta;
  actions?: ReactNode;
  children?: ReactNode | ReactNode[];
  counter?: string;
  secondary?: ReactNode;
  panelContent?: ReactNode;
  protected?: boolean;
}

const PageLayout: FC<Props> = ({
  title,
  meta,
  pageTitle,
  secondary,
  panelContent,
  protected: isProtected = true,
  children,
  counter,
  actions,
}) => {
  const visibleTitle = title || meta?.title || pageTitle;
  const metaTitle = meta?.title || pageTitle || title;
  const page = (
    <>
      <Helmet>
        <title data-amp-mask>{metaTitle}</title>
      </Helmet>
      <ContentLayout
        disableOverlap
        defaultPadding
        headerVariant={'high-contrast'}
        header={
          // 84px is the height of the header minus Cloudscape’s default padding (120px total)
          <div className={'print:hidden'}>
            <div className={'flex items-center flex-wrap mx-auto min-h-[64px]'}>
              <div className={'block w-full'}>
                <SpaceBetween size={'m'}>
                  <PageHeader counter={counter} actions={actions}>
                    {visibleTitle}
                  </PageHeader>
                  {secondary}
                </SpaceBetween>
              </div>
            </div>
          </div>
        }
      >
        <div className={'py-5 max-w-full mx-auto'}>
          <ErrorBoundary
            onError={(error) => handleError(error)}
            fallback={
              <Alert header={'Error'} type={'error'}>
                {'An error has occurred'}
              </Alert>
            }
          >
            <SpaceBetween size={'m'}>{children}</SpaceBetween>
          </ErrorBoundary>
        </div>
      </ContentLayout>
    </>
  );

  return isProtected ? (
    <AuthenticatedAppLayout panelContent={panelContent}>
      {page}
    </AuthenticatedAppLayout>
  ) : (
    <>{children}</>
  );
};

export default PageLayout;
