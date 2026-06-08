import { useMutation } from '@apollo/client';
import Modal from '@risksmart-app/components/src/modal';
import type { InsertInternalAuditReportMutationVariables } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetInternalAuditReportByIdDocument,
  GetInternalAuditReportsDocument,
  InsertInternalAuditReportDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ownerAndContributorIds } from 'src/components/form';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import InternalAuditReportForm from 'src/pages/internal-audit/reports/forms/internal-audit-report-form/InternalAuditReportForm';
import type { InternalAuditReportFormDataFields } from 'src/pages/internal-audit/reports/forms/internal-audit-report-form/internalAuditReportSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

interface Props {
  parent: ObjectWithContributors;
  onDismiss: (saved: boolean) => void;
  onSave?: () => void;
}

const InternalAuditReportModal: FC<Props> = ({
  onDismiss,
  parent,
  onSave: parentOnSave,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'internalAuditReports',
  });

  const { hasPermission: userCanCreate, loading: userCanCreateLoading } =
    useHasPermissionQuery('insert:internal_audit_report', parent);

  const [mutate] = useMutation(InsertInternalAuditReportDocument, {
    update: (cache) => {
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'internal_audit_report');
      evictField(cache, 'internal_audit_report_aggregate');
    },
    refetchQueries: [
      GetInternalAuditReportByIdDocument,
      GetInternalAuditReportsDocument,
    ],
  });

  const onSave = async (variables: InternalAuditReportFormDataFields) => {
    const data: InsertInternalAuditReportMutationVariables = {
      object: {
        CustomAttributeData: variables.CustomAttributeData || undefined,
        ...ownerAndContributorIds(variables),
        TagTypeIds: variables.tags?.map((t) => t.TagTypeId) || [],
        DepartmentTypeIds:
          variables.departments?.map((d) => d.DepartmentTypeId) || [],
        OriginatingItemId: parent.Id,
        CompletedByUser: variables.CompletedByUser?.value ?? null,
        Status: variables.Status,
        Title: variables.Title,
        Summary: variables.Summary,
        ActualCompletionDate: variables.ActualCompletionDate,
        NextTestDate: variables.NextTestDate,
        StartDate: variables.StartDate,
        TargetCompletionDate: variables.TargetCompletionDate,
        Outcome: variables.Outcome,
      },
    };
    await mutate({
      variables: data,
    });
    parentOnSave?.();
  };

  return (
    <Modal
      header={t('create_title')}
      visible={true}
      onDismiss={(event) => {
        // don't close modal on overlay click
        if (event.detail.reason === 'overlay') {
          return;
        }
        onDismiss(false);
      }}
      disableContentPaddings={true}
    >
      <InternalAuditReportForm
        readOnly={!userCanCreate || userCanCreateLoading}
        onSave={onSave}
        renderTemplate={(renderProps) => <ModalBodyWrapper {...renderProps} />}
        onDismiss={onDismiss}
      />
    </Modal>
  );
};

export default InternalAuditReportModal;
