import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetApprovalTableProps } from './config';
import ApprovalModal from './modals/ApprovalModal';

type Props = {
  parent?: ObjectWithContributors;
  approvalType?: Parent_Type_Enum;
};

/**
 * Tab for displaying approval
 *
 * @param parent - The object which the approval process is placed on
 * @param approvalType - The object which the approvals are configured from
 *   (defaults to parentType if not provided)
 */
export const ApprovalsTab: FC<Props> = ({ parent, approvalType }) => {
  useI18NSummaryHelpContent(
    parent ? 'approvals.objectLevelHelp' : 'approvals.help'
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [updateApprovalId, setUpdateApprovalId] = useState<null | string>(null);
  const { t } = useTranslation(['common'], { keyPrefix: 'approvals' });

  const tableProps = useGetApprovalTableProps(parent, (item) => {
    setUpdateApprovalId(item.Id);
    setModalOpen(true);
  });

  const {
    hasPermission: canUpdateApproval,
    loading: canUpdateApprovalLoading,
  } = useHasPermissionQuery(`update:${approvalType!}`, parent);

  const hasPermission =
    !canUpdateApprovalLoading && (canUpdateApproval || !approvalType);

  useEffect(() => {
    if (!modalOpen) {
      setUpdateApprovalId(null);
    }
  }, [modalOpen]);

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={() => {
                      setModalOpen(true);
                      setUpdateApprovalId(null);
                    }}
                    disabled={!hasPermission}
                  >
                    {t('add_approval')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('approvalTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
      />
      <ApprovalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        approvalId={updateApprovalId}
        parentId={parent?.Id}
        readOnly={!hasPermission}
      />
    </>
  );
};
