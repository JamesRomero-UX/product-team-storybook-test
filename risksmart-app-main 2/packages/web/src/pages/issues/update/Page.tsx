import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useGetIssueById } from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useDeleteIssues } from '@/hooks/mutations/issue';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'actions'
    | 'assessment'
    | 'causes'
    | 'consequences'
    | 'details'
    | 'linkedItems'
    | 'notificationHistory'
    | 'updates';
  showDeleteButton?: boolean;
  issueType: ParentIssueType;
};

const Page: FC<Props> = ({ activeTabId, showDeleteButton, issueType }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);

  const issueId = useGetGuidParam('issueId');
  const { data, error, loading } = useGetIssueById({
    queryArgs: { id: issueId! },
    shouldSkip: !issueId,
  });
  if (error) {
    throw error;
  }
  const detailsPath = useGetDetailPath(issueId);
  const parentPath = useGetDetailParentPath(issueId);

  const issue = data?.issue?.[0];
  if (!loading && issueType !== issue?.Type) {
    throw new PageNotFound(`${issueType} with id ${issueId} not found`);
  }
  const issueTypeMap = IssueTypeMapping[issueType];
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMap.taxonomy,
  });
  const defaultTitle = st('fallback_title');
  const [exportItem, { loading: exporting }] = useExporter(issueId, issueType);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { deleteIssues, loading: deleteLoading } = useDeleteIssues();

  const tabs = useTabs({
    parentType: Parent_Type_Enum.Issue,
    parent: issue,
    hrefRoot: detailsPath,
    disabled: false,
    issueSubType: (issue?.Type as ParentIssueType) ?? Parent_Type_Enum.Issue,
  });

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!issue) {
        throw new Error(`No ${st('entity_name')} found`);
      }
      await deleteIssues({
        Ids: [issue.Id],
      });
      navigate(parentPath);

      return true;
    },
  });

  if (data?.issue.length === 0) {
    throw new PageNotFound(`${st('entity_name')} with id ${issueId} not found`);
  }
  const title = issue && issue.Title;
  const counter =
    issue &&
    `(${getFriendlyId(issue?.Type ?? Parent_Type_Enum.Issue, issue.SequentialId)})`;

  return (
    <PageLayout
      title={title}
      meta={{ title: defaultTitle }}
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
          {showDeleteButton && (
            <Permission permission={'delete:issue'} parentObject={issue}>
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
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Issue}
        parent={issue}
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
