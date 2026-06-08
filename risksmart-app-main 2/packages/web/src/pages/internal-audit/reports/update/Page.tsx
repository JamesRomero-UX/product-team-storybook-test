import { useMutation } from '@apollo/client';
import { Alert } from '@risk-smart/themed-cloudscape-components';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteInternalAuditReportsDocument,
  GetInternalAuditReportResultCountDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import {
  useGetInternalAuditReportById,
  useGetInternalAuditReportsRegister,
} from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'activities'
    | 'details'
    | 'findings'
    | 'impacts'
    | 'linkedItems';
  activityMode?: 'addActivity' | 'list' | 'updateActivity' | undefined;
};

const Page: FC<Props> = ({ activeTabId, activityMode = undefined }) => {
  const { t } = useTranslation(['common']);
  const internalAuditReportId = useGetGuidParam('assessmentId');
  const [exportItem, { loading: exporting }] = useExporter(
    internalAuditReportId
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const parentUrl = useGetDetailParentPath(internalAuditReportId);
  const detailsPath = useGetDetailPath(internalAuditReportId);
  const [mutate, deleteResult] = useMutation(
    DeleteInternalAuditReportsDocument,
    {
      update: (cache) => {
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'internal_audit_report_aggregate');
      },
      fetchPolicy: 'no-cache',
    }
  );

  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });
  const { data, error, loading, refetch } = useGetInternalAuditReportById({
    queryArgs: { reportId: internalAuditReportId },
  });
  const { refetch: refetchInternalAuditsReportsRegister } =
    useGetInternalAuditReportsRegister({ queryArgs: {} });

  if (error) {
    throw error;
  }

  const internalAuditReport = data?.internal_audit_report[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.InternalAuditReport,
    parent: internalAuditReport,
    assessmentActivityMode: activityMode,
    assessmentMode: 'internal_audit_report',
    hrefRoot: detailsPath,
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity'),
    asyncAction: async () => {
      if (!internalAuditReport) {
        return false;
      }
      await mutate({
        variables: {
          Ids: [internalAuditReport.Id],
        },
        refetchQueries: [GetInternalAuditReportResultCountDocument],
      });
      await refetchInternalAuditsReportsRegister();
      await navigate(parentUrl);
      refetch();

      return true;
    },
  });

  if (!loading && !internalAuditReport?.Id) {
    throw new PageNotFound(
      `Internal audit report with id ${internalAuditReportId} not found`
    );
  }

  const counter =
    internalAuditReport &&
    `(${getFriendlyId(
      Parent_Type_Enum.InternalAuditReport,
      internalAuditReport.SequentialId
    )})`;
  const fallbackTitle = st('fallback_title');

  return (
    <PageLayout
      actions={
        <Permission
          permission={'delete:internal_audit_report'}
          parentObject={internalAuditReport}
        >
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              iconName={'download'}
              disabled={exporting}
              onClick={exportItem}
            >
              {t('export.export')}
            </Button>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_button')}
            </Button>
          </SpaceBetween>
        </Permission>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={internalAuditReport?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.InternalAuditReport}
        parent={internalAuditReport}
      />

      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        <SpaceBetween size={'s'}>
          <Alert type={'warning'} dismissible={false}>
            {st('delete_modal_warning')}
          </Alert>
          {st('confirm_delete_message')}
        </SpaceBetween>
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
