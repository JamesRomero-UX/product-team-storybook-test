import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import {
  DeleteThirdPartyDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { useGetThirdPartyById } from 'src/hooks/queries/third-party/useGetThirdPartyById';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { evictField } from '@/utils/graphqlUtils';
import { thirdPartyDetailsUrl } from '@/utils/urls';

import { useGetDetailParentPath } from '../../../routes/useGetDetailParentPath';
import { useExporter } from './useExporter';
interface Props {
  activeTabId?:
    | 'actions'
    | 'contacts'
    | 'controls'
    | 'details'
    | 'linkedItems'
    | 'notificationHistory'
    | 'questionnaires'
    | IssueTaxonomyKeys;
  showDeleteButton?: boolean;
}

const Page: FC<Props> = ({ activeTabId, showDeleteButton }: Props) => {
  const thirdPartyId = useGetGuidParam('id');
  const parentUrl = useGetDetailParentPath(thirdPartyId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { data } = useGetThirdPartyById({ queryArgs: { thirdPartyId } });
  const navigate = useNavigate();

  const title = data?.third_party?.Title || '';
  const tabs = useTabs({
    parentType: Parent_Type_Enum.ThirdParty,
    parent: data?.third_party,
    hrefRoot: thirdPartyDetailsUrl(thirdPartyId),
  });
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'third_party' });

  const [mutate, deleteResult] = useMutation(DeleteThirdPartyDocument, {
    update: (cache) => {
      evictField(cache, 'third_party');
      evictField(cache, 'third_party_by_pk');
    },
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!data) {
        return false;
      }
      await mutate({
        variables: {
          Id: thirdPartyId,
        },
      });
      await navigate(parentUrl);

      return true;
    },
  });

  const [exportItem, { loading: exporting }] = useExporter(thirdPartyId);

  return (
    <PageLayout
      title={title}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            iconName={'download'}
            disabled={exporting}
            onClick={exportItem}
          >
            {t('export.export')}
          </Button>

          {showDeleteButton && (
            <Permission
              permission={'delete:third_party'}
              parentObject={data?.third_party}
            >
              <Button
                variant={'normal'}
                formAction={'none'}
                onClick={() => {
                  setIsDeleteModalVisible(true);
                }}
              >
                {st('delete_button')}
              </Button>
            </Permission>
          )}
        </SpaceBetween>
      }
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.ThirdParty}
        parent={data?.third_party || undefined}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
        size={'medium'}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
