import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import NotFoundPage from '@risksmart-app/components/src/error-pages/NotFoundPage';
import { useFileDownload } from '@risksmart-app/components/src/file/useFileDownload';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import i18n from '@risksmart-app/i18n/src/i18n';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { AttestButton } from 'src/components/attest-button/AttestButton';
import Loading from 'src/components/loading';
import { PolicyDocumentPreview } from 'src/components/policy-document-preview/PolicyDocumentPreview';
import Tokens from 'src/components/tokens';
import { PageLayout } from 'src/layouts';

import Link from '@/components/link';
import { publicPolicyFileUrl } from '@/utils/urls';

import { usePublicDocument } from './config';
import styles from './style.module.scss';

const Page = () => {
  const fileId = useGetGuidParam('fileId');
  const documentId = useGetGuidParam('documentId');
  const { loading, error, data } = usePublicDocument(documentId, fileId);
  const downloadFile = useFileDownload();
  const { t } = useTranslation(['taxonomy']);
  const { t: tt } = useTranslation(['common'], { keyPrefix: 'policy' });

  const handleFileDownload = async () => {
    if (!data || data.type !== 'file') {
      return;
    }
    await downloadFile(
      {
        fileId: data.documentFile.FileId,
        fileName: data.fileName,
      },
      true
    );
  };

  if (error) {
    return <NotFoundPage />;
  }

  const title = data
    ? `${data?.documentFile.parent?.Title} (${data?.documentFile.Version})`
    : '';

  const owners = [
    ...(data?.documentFile.parent?.owners ?? []),
    ...(data?.documentFile.parent?.ownerGroups ?? []),
  ];

  return (
    <PageLayout
      helpTranslationKey={'policy.publicPolicyFileHelp'}
      title={title}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {data?.type === 'file' ? (
            <Button onClick={handleFileDownload}>
              {'Download'}
              {/* TODO: translation*/}
            </Button>
          ) : null}
          {data?.documentFile ? (
            <AttestButton parentId={data.documentFile.Id} />
          ) : null}
        </SpaceBetween>
      }
    >
      <div className={'flex lg:items-start flex-col-reverse lg:flex-row gap-6'}>
        <Container {...{ className: 'flex-1' }}>
          {!data || loading ? (
            <Loading />
          ) : (
            <PolicyDocumentPreview data={data} />
          )}
        </Container>
        <Container {...{ className: styles.sideBarWrapper }}>
          {!data || loading ? (
            <Loading />
          ) : (
            <div className={'flex flex-col gap-3'}>
              <Header variant={'h2'}>{tt('details')}</Header>
              <div>
                <div>
                  {tt('publicVersion')}
                  {':'} <strong>{data.documentFile.Version}</strong>
                </div>
                {data.documentFile.PublishedDate ? (
                  <div>
                    {tt('publicPublishedDate')}
                    {':'}{' '}
                    <strong>
                      {dayjs(data.documentFile.PublishedDate).format(
                        'DD MMM YYYY'
                      )}
                    </strong>
                  </div>
                ) : null}
                <div>
                  {i18n.format(
                    t('owner', { count: owners.length }),
                    'capitalizeAll'
                  )}
                  {':'}{' '}
                  <strong>
                    {owners
                      .map((o) =>
                        'user' in o
                          ? o.user?.FriendlyName
                          : 'group' in o
                            ? o.group?.Name
                            : ''
                      )
                      .join(', ')}
                  </strong>
                </div>
              </div>
              {(data.documentFile.parent?.tags.length ?? 0) > 0 ? (
                <div className={'mb-3'}>
                  {i18n.format(t('tag_one'), 'capitalizeAll')}
                  {':'}{' '}
                  <Tokens
                    tokens={
                      data.documentFile.parent?.tags.map((tag) => ({
                        value: tag.TagTypeId,
                        label: tag.type?.Name ?? '',
                      })) ?? []
                    }
                    disabled={true}
                    onRemove={() => null}
                  />
                </div>
              ) : null}
              {(data.documentFile.parent?.linkedDocuments.length ?? 0) > 0 ? (
                <div>
                  <div>
                    {tt('publicLinkedDocuments')}
                    {':'}
                  </div>
                  <ul className={'list-none p-0 m-0 mt-2'}>
                    {data.documentFile.parent?.linkedDocuments.map((doc, i) => (
                      <li key={i}>
                        <Link
                          key={i}
                          href={publicPolicyFileUrl(doc.child?.Id ?? '')}
                        >
                          <strong>{doc.child?.Title}</strong>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </div>
    </PageLayout>
  );
};

export default Page;
