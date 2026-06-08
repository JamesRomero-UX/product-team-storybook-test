import { useApolloClient, useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { RelationFile } from '@risksmart-app/shared/forms/shared-schemas/fileSchema';
import {
  DeleteObligationChangeAttestationDocument,
  InsertObligationChangeAttestationOneDocument,
  LinkItemsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { ObligationChangeDetails } from 'src/blocks';
import { ownerAndContributorIds } from 'src/components/form';
import Loading from 'src/components/loading';
import { PageLayout } from 'src/layouts';
import ActionModal from 'src/pages/actions/ActionModal';
import type { ActionFormFieldData } from 'src/pages/actions/update/forms/actionsSchema';
import { toLocalDate } from 'src/utils/dateUtils';
import { getFriendlyId } from 'src/utils/friendlyId';

import { useInsertChildAction } from '@/hooks/mutations/action/useInsertChildAction';
import { useGetObligationChangeById } from '@/hooks/queries/obligation-change/useGetObligationChangeById';
import { evictField } from '@/utils/graphqlUtils';
import { obligationChangesRegisterUrl } from '@/utils/urls';

const ObligationChangeDetailPage: FC = () => {
  const { obligationChangeId } = useParams<{ obligationChangeId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'obligationChanges' });
  const { user } = useRisksmartUser();
  const apolloClient = useApolloClient();
  const { updateFiles } = useFileUpdate();

  const { data, loading, refetch } = useGetObligationChangeById({
    queryArgs: { obligationChangeId: obligationChangeId! },
  });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const [insertAttestation, { loading: insertAttestationLoading }] =
    useMutation(InsertObligationChangeAttestationOneDocument);
  const [deleteAttestation, { loading: deleteAttestationLoading }] =
    useMutation(DeleteObligationChangeAttestationDocument);
  const { insertChildAction, loading: insertActionLoading } =
    useInsertChildAction();
  const [linkItem] = useMutation(LinkItemsDocument);

  const record = data?.obligation_change?.[0];
  const isRead = record?.attestations.some((a) => a.UserId === user?.userId);

  const handleMarkAsRead = async () => {
    if (!obligationChangeId) {
      return;
    }
    await insertAttestation({
      variables: {
        object: {
          ObligationChangeId: obligationChangeId,
          UserId: user!.userId,
        },
      },
    });
    evictField(apolloClient.cache, 'obligation_change');
    refetch();
  };

  const handleMarkAsUnread = async () => {
    if (!obligationChangeId) {
      return;
    }
    await deleteAttestation({
      variables: {
        object: {
          ObligationChangeId: obligationChangeId,
          UserId: user!.userId,
        },
      },
    });
    evictField(apolloClient.cache, 'obligation_change');
    refetch();
  };

  const handleCreateAction = async (values: ActionFormFieldData) => {
    const { files } = values;
    const result = await insertChildAction({
      ...values,
      ParentId: obligationChangeId!,
      CustomAttributeData: values.CustomAttributeData || undefined,
      DepartmentTypeIds:
        values.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: values.tags?.map((t) => t.TagTypeId) || [],
      ...ownerAndContributorIds(values),
    });
    const actionId = result?.insertChildAction?.Id;
    if (!actionId) {
      throw new Error('Missing actionId');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Action,
      parentId: actionId,
      originalFiles: values?.files.filter(
        (f) => !(f instanceof File)
      ) as RelationFile[],
      selectedFiles: files,
    });
    if (data?.obligation_change?.[0]?.obligation) {
      await linkItem({
        variables: {
          Source: data?.obligation_change?.[0]?.obligation.Id,
          Targets: [actionId],
        },
      });
    }
    evictField(apolloClient.cache, 'action');
    evictField(apolloClient.cache, 'obligation_change');
    setIsActionModalOpen(false);
    refetch();
  };

  const sequentialIdLabel = record
    ? `(${getFriendlyId('obligation_change', record.SequentialId)})`
    : '';

  return (
    <PageLayout
      helpTranslationKey={'obligationChanges.registerHelp'}
      title={record?.obligation?.Title || t('detail_title')}
      counter={sequentialIdLabel}
    >
      {loading ? (
        <Loading />
      ) : (
        <SpaceBetween size={'m'}>
          <ObligationChangeDetails
            lang={{
              cards: {
                details: t('details'),
                current: t('current'),
                upcoming: t('upcoming'),
              },
              status: {
                unread: t('unread'),
                read: t('read'),
              },
              details: {
                status: t('columns.status'),
                effectiveDate: t('columns.effective_date'),
                regulatoryBody: t('columns.regulator'),
                referenceCode: t('columns.reference'),
                tags: t('columns.tags'),
              },
            }}
            state={{
              currentDescription:
                data?.obligation_change?.[0]?.DescriptionBefore ??
                'No description provided',
              upcomingDescription:
                data?.obligation_change?.[0]?.DescriptionAfter ||
                'No description provided',
              effectiveDate: data?.obligation_change?.[0]?.EffectiveDate
                ? toLocalDate(data?.obligation_change?.[0]?.EffectiveDate)
                : '-',
              status: isRead ? 'read' : 'unread',
              regulatoryBody:
                data?.obligation_change?.[0]?.obligation?.regulatorySource
                  ?.RegulatorName || '-',
              referenceCode:
                data?.obligation_change?.[0]?.obligation?.Reference || '-',
              tags: ['-'], // @TODO: add tags to obligation changes and display here
            }}
          />

          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              variant={'normal'}
              onClick={() => navigate(obligationChangesRegisterUrl())}
              disabled={
                insertActionLoading ||
                insertAttestationLoading ||
                deleteAttestationLoading
              }
            >
              {t('cancel')}
            </Button>
            {!isRead && (
              <Button
                variant={'normal'}
                onClick={handleMarkAsRead}
                loading={insertActionLoading || insertAttestationLoading}
              >
                {t('mark_as_read')}
              </Button>
            )}
            {isRead && (
              <Button
                variant={'normal'}
                onClick={handleMarkAsUnread}
                loading={insertActionLoading || deleteAttestationLoading}
              >
                {t('mark_as_unread')}
              </Button>
            )}
            <Button
              variant={'primary'}
              onClick={() => setIsActionModalOpen(true)}
              loading={
                insertActionLoading ||
                insertAttestationLoading ||
                deleteAttestationLoading
              }
            >
              {t('create_action')}
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      )}

      {isActionModalOpen && (
        <ActionModal
          onSaving={handleCreateAction}
          onDismiss={() => setIsActionModalOpen(false)}
        />
      )}
    </PageLayout>
  );
};

export default ObligationChangeDetailPage;
