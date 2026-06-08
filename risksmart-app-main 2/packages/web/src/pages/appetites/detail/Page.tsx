import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import Loading from '@risksmart-app/components/src/loading';
import { useGetOptionalGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useDeleteAppetites } from '@/hooks/mutations/appetite';
import { useGetAppetiteById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { appetiteDetailsUrl } from '@/utils/urls';

const Page = () => {
  const { t: st } = useTranslation('common', { keyPrefix: 'appetites' });
  const { t } = useTranslation('common');
  const appetiteId = useGetOptionalGuidParam('appetiteId');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Appetite,
    parent: null,
    hrefRoot: appetiteId ? appetiteDetailsUrl(appetiteId) : '',
  });
  const { data, loading } = useGetAppetiteById({
    queryArgs: { id: appetiteId ?? '' },
    shouldSkip: !appetiteId,
  });
  if (data?.appetite.length === 0) {
    throw new PageNotFound(`Appetite with id ${appetiteId} not found`);
  }
  const appetite = data?.appetite[0];
  const navigate = useNavigate();
  const { deleteAppetites, loading: deleteLoading } = useDeleteAppetites();

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteAppetites([appetite!.Id]);
      setIsDeleteModalVisible(false);
      navigate('..');

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      helpTranslationKey={'appetites.help'}
      title={getFriendlyId(Parent_Type_Enum.Appetite, appetite?.SequentialId)}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission permission={'delete:appetite'} parentObject={appetite}>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {t('delete')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Appetite}
        parent={appetite}
      />
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
