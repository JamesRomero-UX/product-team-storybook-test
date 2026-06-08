import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useDeleteIndicators } from '@/hooks/mutations/indicator/useDeleteIndicators';
import { useGetIndicatorById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';

import useExporter from './useExporter';

type Props = {
  activeTabId: 'details' | 'linkedItems' | 'results' | 'notificationHistory';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const indicatorId = useGetGuidParam('indicatorId');
  const [exportItem, { loading: exporting }] = useExporter(indicatorId);
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);

  const parentPath = useGetDetailParentPath(indicatorId);
  const detailPath = useGetDetailPath(indicatorId);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'indicators' });
  const defaultTitle = st('fallback_title');

  const { data, error } = useGetIndicatorById({
    queryArgs: { id: indicatorId },
    shouldSkip: !indicatorId,
  });
  if (error) {
    throw error;
  }

  const indicator = data?.indicator?.[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Indicator,
    parent: indicator,
    hrefRoot: detailPath,
  });
  const { deleteIndicators, loading: deleteLoading } = useDeleteIndicators();

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      if (!indicator) {
        throw new Error('Indicator not selected');
      }
      await deleteIndicators([indicator.Id]);
      navigate(parentPath);
      setIsDeleteModalVisible(false);

      return true;
    },
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (data?.indicator.length === 0) {
    throw new PageNotFound(`Indicator with id ${indicatorId} not found`);
  }
  const counter =
    indicator &&
    `(${getFriendlyId(Parent_Type_Enum.Indicator, indicator.SequentialId)})`;

  return (
    <PageLayout
      title={indicator?.Title ?? defaultTitle}
      meta={{
        title: defaultTitle,
      }}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            iconName={'download'}
            disabled={exporting}
            onClick={exportItem}
          >
            {t('export.export')}
          </Button>
          <Permission permission={'delete:indicator'} parentObject={indicator}>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_title')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Indicator}
        parent={indicator}
      />
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={st('delete_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
