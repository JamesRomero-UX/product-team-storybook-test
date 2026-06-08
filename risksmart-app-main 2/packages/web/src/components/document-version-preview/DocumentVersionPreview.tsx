import { isApolloError, useMutation } from '@apollo/client';
import Button from '@risksmart-app/components/src/button';
import Loading from '@risksmart-app/components/src/loading';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { UpdateDocumentVersionMutationVariables } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Document_File_Type_Enum,
  UpdateDocumentVersionDocument,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ConfirmChangeRequestModal } from 'src/components/change-requests-preview/ConfirmChangeRequestModal';
import PolicyDocumentStatusBadge from 'src/components/policy-document-status-badge/PolicyDocumentStatusBadge';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useGetDocumentFileById } from '@/hooks/queries';
import { useChangeRequests } from '@/hooks/useChangeRequests';
import { mutationResultNotification } from '@/hooks/useMutationResultNotification';
import { toLocalDate } from '@/utils/dateUtils';
import { evictField } from '@/utils/graphqlUtils';
import { policyFileUrl } from '@/utils/urls';

type Props = {
  document: ObjectWithContributors;
  documentFileId: string;
};

function DocumentVersionPreview({ document, documentFileId }: Props) {
  const { data, loading: loadingDocument } = useGetDocumentFileById({
    queryArgs: { id: documentFileId },
  });

  const { t } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.versionPreview',
  });
  const navigate = useNavigate();

  const [update] = useMutation(UpdateDocumentVersionDocument, {
    update: (cache) => {
      evictField(cache, 'document_file_by_pk');
      evictField(cache, 'document_file');
      evictField(cache, 'document');
    },
  });

  const documentVersion = data?.document_file[0];
  const documentIsDraft =
    documentVersion?.Status === Version_Status_Enum.Draft ||
    documentVersion?.Status === Version_Status_Enum.PendingApproval;
  const objectWithApprovals = documentVersion
    ? {
        ...documentVersion,
        owners: documentVersion.parent?.owners ?? [],
        ownerGroups: documentVersion.parent?.ownerGroups ?? [],
      }
    : undefined;

  const [showConfirmChangeRequest, setShowConfirmChangeRequest] =
    useState(false);
  const { pendingChangeRequests, loading: loadingChangeRequests } =
    useChangeRequests(objectWithApprovals);
  const { addNotification } = useNotifications();
  const loading = loadingDocument || loadingChangeRequests;

  const handlePublish = async (confirm?: boolean) => {
    if (!documentVersion) {
      return;
    }
    await mutationResultNotification({
      addNotification,
      successMessageKey: 'update_success_message',
      entityName: 'Document Version',
      asyncAction: async () => {
        try {
          await update({
            variables: {
              ...documentVersion,
              Status: Version_Status_Enum.Published,
              LatestModifiedAtTimestamp: documentVersion.ModifiedAtTimestamp,
            } as unknown as UpdateDocumentVersionMutationVariables,
            context: {
              headers: {
                'x-confirm-change-request': confirm ? 'true' : 'false',
              },
            },
          });
        } catch (error) {
          const e = error as Error;
          if (
            isApolloError(e) &&
            e.graphQLErrors.some((er) =>
              er.message.includes('You need to create a change request')
            )
          ) {
            setShowConfirmChangeRequest(true);

            return false;
          }
        }

        return true;
      },
    })({});
  };

  const handleOpen = useCallback(() => {
    if (!documentVersion) {
      return;
    }
    if (
      documentVersion.Type === Document_File_Type_Enum.Link &&
      documentVersion.Link
    ) {
      window.open(documentVersion.Link, '_blank');
    } else if (
      documentVersion.FileId ||
      documentVersion.Type === Document_File_Type_Enum.Html
    ) {
      navigate(policyFileUrl(document.Id, documentVersion.Id));
    }
  }, [document.Id, documentVersion, navigate]);

  if (!documentVersion) {
    return null;
  }

  return loading ? (
    <Loading />
  ) : (
    <>
      {showConfirmChangeRequest && (
        <ConfirmChangeRequestModal
          onDismiss={() => setShowConfirmChangeRequest(false)}
          onConfirm={() => handlePublish(true)}
        />
      )}
      <div
        className={`p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
      >
        <h3 className={'m-0'}>
          {documentIsDraft ? t('latestDraftTitle') : t('latestPublishedTitle')}
        </h3>
        <div
          className={
            'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex flex-col gap-2'
          }
        >
          <div className={'flex justify-between'}>
            <h3 className={'m-0'}>
              {t('version', { version: documentVersion.Version })}
            </h3>
            <PolicyDocumentStatusBadge
              item={documentVersion}
              changeRequests={documentVersion.changeRequests}
            />
          </div>
          <p className={'text-grey600 m-0 mb-3'}>
            <strong>
              {t('created')}
              {':'}
            </strong>{' '}
            {toLocalDate(documentVersion.CreatedAtTimestamp)}
          </p>
          <div className={'flex gap-2'}>
            {!documentIsDraft ? (
              <Button
                variant={'primary'}
                formAction={'none'}
                onClick={handleOpen}
              >
                {t('view')}
              </Button>
            ) : null}
            {documentIsDraft && (
              <>
                <Button
                  formAction={'none'}
                  onClick={() => navigate(`files/update/${documentVersion.Id}`)}
                  variant={'primary'}
                >
                  {t('view')}
                </Button>
                {pendingChangeRequests.length < 1 && (
                  <Button onClick={() => handlePublish()}>{'Publish'}</Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DocumentVersionPreview;
