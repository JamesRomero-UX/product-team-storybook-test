import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetObligationInternalAuditResultByIdDocument,
  InsertObligationInternalAuditResultDocument,
  Parent_Type_Enum,
  UpdateObligationInternalAuditResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import ObligationAssessmentResultForm from 'src/pages/assessments/forms/ObligationAssessmentResultForm';
import type { ObligationAssessmentResultFormDataFields } from 'src/pages/assessments/forms/obligationAssessmentResultSchema';
import { defaultValues } from 'src/pages/assessments/forms/obligationAssessmentResultSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { internalAuditReportResultsUrl } from '@/utils/urls';

type Props = {
  readonly: boolean;
  navigateToResults: boolean;
  isModalForm: boolean;
  parentId?: string;
  assessedItem?: ObjectWithContributors;
  id?: string;
  onDismiss?: (saved: boolean) => void;
  beforeFieldsSlot?: ReactNode;
  showAssessmentSelector?: boolean;
  obligationIds?: string[];
  header?: string;
};

const ConnectedObligationInternalAuditResultForm: FC<Props> = ({
  readonly,
  parentId,
  assessedItem,
  id,
  onDismiss,
  beforeFieldsSlot,
  showAssessmentSelector,
  navigateToResults,
  isModalForm,
  obligationIds,
  header,
}) => {
  const navigate = useNavigate();
  const { data } = useQuery(GetObligationInternalAuditResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const obligationAssessmentResult =
    data?.obligation_internal_audit_result?.[0];
  const {
    hasPermission: canUpdateObligationAssessmentResult,
    loading: isLoadingCanUpdateObligationAssessmentResult,
  } = useHasPermissionQuery(
    'update:obligation_internal_audit_result',
    assessedItem
  );
  const { updateFiles } = useMultiParentFileUpdate();
  const [insertObligationAssessmentResult] = useMutation(
    InsertObligationInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'obligation_internal_audit_result_aggregate');
      },
    }
  );

  const [updateObligationAssessmentResult] = useMutation(
    UpdateObligationInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'obligation_internal_audit_result_aggregate');
      },
    }
  );

  obligationIds = obligationIds ?? [];
  const parentObligation = obligationAssessmentResult?.parents.find(
    (p) => p.obligation
  );
  if (parentObligation?.obligation?.Id) {
    obligationIds.push(parentObligation.obligation.Id);
  } else if (assessedItem?.Id) {
    obligationIds.push(assessedItem.Id);
  }

  const onSave = async (values: ObligationAssessmentResultFormDataFields) => {
    const { files } = values;
    const obligationAssessmentResultIds: string[] = [];
    if (obligationAssessmentResult) {
      const result = await updateObligationAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          Id: obligationAssessmentResult.Id,
        },
      });

      if (
        result.data?.update_obligation_internal_audit_result?.affected_rows ===
        0
      ) {
        throw new Error('Obligation assessment result update failed');
      }
      obligationAssessmentResultIds.push(id!);
    } else {
      const result = await insertObligationAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          InternalAuditReportId: parentId!,
          ObligationIds: values?.ObligationIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildObligationInternalAuditResult?.Ids) {
        throw new Error('Obligation assessment result id is missing');
      }
      obligationAssessmentResultIds.push(
        ...result.data.insertChildObligationInternalAuditResult.Ids
      );
    }

    await updateFiles({
      parentIds: obligationAssessmentResultIds,
      parentType: Parent_Type_Enum.ObligationInternalAuditResult,
      selectedFiles: files,
      originalFiles: obligationAssessmentResult?.files.map((f) => f.file),
    });
    if (navigateToResults && parentId) {
      navigate(internalAuditReportResultsUrl(parentId));
    }
  };

  return (
    <ObligationAssessmentResultForm
      header={header}
      onDismiss={onDismiss}
      defaultValues={{
        ...defaultValues,
        ObligationIds: obligationIds.map((c) => ({ value: c })),
        AssessmentId: parentId ?? null,
      }}
      values={
        obligationAssessmentResult
          ? {
              Rating: obligationAssessmentResult?.Rating ?? 1,
              Rationale: obligationAssessmentResult?.Rationale ?? '',
              ComplianceMonitoringAssessmentId: parentId,
              ObligationIds: obligationIds.map((c) => ({ value: c })),
              TestDate: obligationAssessmentResult?.TestDate,
              CustomAttributeData:
                obligationAssessmentResult?.CustomAttributeData,
              files: obligationAssessmentResult?.files.map((f) => f.file),
            }
          : undefined
      }
      onSave={onSave}
      readOnly={
        readonly &&
        !isLoadingCanUpdateObligationAssessmentResult &&
        !canUpdateObligationAssessmentResult
      }
      renderTemplate={(renderProps) =>
        isModalForm ? (
          <ModalBodyWrapper {...renderProps} />
        ) : (
          <PageWrapper {...renderProps} />
        )
      }
      disableObligationSelector={id != undefined}
      beforeFieldsSlot={beforeFieldsSlot}
      showSelector={
        showAssessmentSelector ? 'internal_audit_report' : undefined
      }
      assessmentMode={'internal_audit_report'}
    />
  );
};

export default ConnectedObligationInternalAuditResultForm;
