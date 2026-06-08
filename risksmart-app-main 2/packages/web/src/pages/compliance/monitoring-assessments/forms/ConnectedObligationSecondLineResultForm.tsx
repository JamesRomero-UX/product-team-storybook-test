import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetObligationSecondLineResultByIdDocument,
  InsertObligationSecondLineResultDocument,
  Parent_Type_Enum,
  UpdateObligationSecondLineResultDocument,
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
import { complianceMonitoringAssessmentResultsUrl } from '@/utils/urls';

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

const ConnectedObligationSecondLineResultForm: FC<Props> = ({
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
  const { data } = useQuery(GetObligationSecondLineResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const obligationAssessmentResult = data?.obligation_second_line_result?.[0];
  const {
    hasPermission: canUpdateObligationAssessmentResult,
    loading: isLoadingCanUpdateObligationAssessmentResult,
  } = useHasPermissionQuery(
    'update:obligation_second_line_result',
    assessedItem
  );
  const { updateFiles } = useMultiParentFileUpdate();
  const [insertObligationAssessmentResult] = useMutation(
    InsertObligationSecondLineResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'obligation_second_line_result_aggregate');
      },
    }
  );

  const [updateObligationAssessmentResult] = useMutation(
    UpdateObligationSecondLineResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'obligation_second_line_result_aggregate');
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
        result.data?.update_obligation_second_line_result?.affected_rows === 0
      ) {
        throw new Error('Obligation second line result update failed');
      }
      obligationAssessmentResultIds.push(id!);
    } else {
      const result = await insertObligationAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          ComplianceMonitoringAssessmentId: parentId!,
          ObligationIds: values?.ObligationIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildObligationSecondLineResult?.Ids) {
        throw new Error('Obligation second line result id is missing');
      }
      obligationAssessmentResultIds.push(
        ...result.data.insertChildObligationSecondLineResult.Ids
      );
    }

    await updateFiles({
      parentIds: obligationAssessmentResultIds,
      parentType: Parent_Type_Enum.ObligationSecondLineResult,
      selectedFiles: files,
      originalFiles: obligationAssessmentResult?.files.map((f) => f.file),
    });
    if (navigateToResults && parentId) {
      navigate(complianceMonitoringAssessmentResultsUrl(parentId));
    }
  };

  return (
    <ObligationAssessmentResultForm
      header={header}
      onDismiss={onDismiss}
      defaultValues={{
        ...defaultValues,
        ObligationIds: obligationIds.map((c) => ({ value: c })),
        ComplianceMonitoringAssessmentId: parentId ?? null,
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
        showAssessmentSelector ? 'compliance_monitoring_assessment' : undefined
      }
      assessmentMode={'compliance_monitoring_assessment'}
    />
  );
};

export default ConnectedObligationSecondLineResultForm;
