import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import type { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetRiskInternalAuditResultByIdDocument,
  InsertRiskInternalAuditResultDocument,
  Parent_Type_Enum,
  UpdateControlledRiskInternalAuditResultDocument,
  UpdateUncontrolledRiskInternalAuditResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useWizardStore } from 'src/components/wizard/store/useWizardStore';
import RiskAssessmentResultForm from 'src/pages/assessments/forms/RiskAssessmentResultForm';
import type { RiskAssessmentResultFormDataFields } from 'src/pages/assessments/forms/riskAssessmentResultSchema';
import { defaultValues } from 'src/pages/assessments/forms/riskAssessmentResultSchema';
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
  riskIds?: string[];
  header?: string;
};

const ConnectedRiskInternalAuditResultForm: FC<Props> = ({
  readonly,
  parentId,
  assessedItem,
  id,
  onDismiss,
  beforeFieldsSlot,
  showAssessmentSelector,
  navigateToResults,
  isModalForm,
  riskIds,
  header,
}) => {
  const navigate = useNavigate();
  const { updateFiles } = useMultiParentFileUpdate();
  const [toolsContent, _] = useTools();
  const {
    assessmentId: wizardAssessmentId,
    steps,
    currentStep,
  } = useWizardStore();

  const { data } = useQuery(GetRiskInternalAuditResultByIdDocument, {
    variables: {
      Id: id!,
    },
    skip: !id,
    fetchPolicy: 'no-cache',
  });
  const controlledRiskAssessmentResult =
    data?.risk_controlled_internal_audit_result?.[0];
  const uncontrolledRiskAssessmentResult =
    data?.risk_uncontrolled_internal_audit_result?.[0];

  const riskAssessmentResult =
    controlledRiskAssessmentResult ?? uncontrolledRiskAssessmentResult;
  const {
    hasPermission: canUpdateRiskAssessmentResult,
    loading: canUpdateLoading,
  } = useHasPermissionQuery(
    [
      'update:risk_controlled_internal_audit_result',
      'update:risk_uncontrolled_internal_audit_result',
    ],
    assessedItem
  );
  const parentType = controlledRiskAssessmentResult
    ? Parent_Type_Enum.RiskControlledInternalAuditResult
    : Parent_Type_Enum.RiskUncontrolledInternalAuditResult;

  const [insertRiskInternalAuditResult] = useMutation(
    InsertRiskInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'risk_uncontrolled_internal_audit_result');
        evictField(cache, 'risk_uncontrolled_internal_audit_result_aggregate');
      },
    }
  );

  const [updateRiskControlledResult] = useMutation(
    UpdateControlledRiskInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'risk_controlled_internal_audit_result');
        evictField(cache, 'risk_controlled_internal_audit_result_aggregate');
      },
    }
  );
  const [updateRiskUncontrolledResult] = useMutation(
    UpdateUncontrolledRiskInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'risk_uncontrolled_internal_audit_result');
        evictField(cache, 'risk_uncontrolled_internal_audit_result_aggregate');
      },
    }
  );
  riskIds = riskIds ?? [];
  const parentRisk = riskAssessmentResult?.parents.find((p) => p.risk);
  if (parentRisk?.risk?.Id) {
    riskIds.push(parentRisk.risk.Id);
  } else if (assessedItem?.Id) {
    riskIds.push(assessedItem.Id);
  }

  const onSave = async (values: RiskAssessmentResultFormDataFields) => {
    const { files } = values;
    const riskAssessmentResultIds: string[] = [];
    if (riskAssessmentResult) {
      if (parentType === Parent_Type_Enum.RiskControlledInternalAuditResult) {
        const result = await updateRiskControlledResult({
          variables: {
            ...values,
            CustomAttributeData: values.CustomAttributeData ?? null,
            Id: riskAssessmentResult.Id,
          },
        });
        if (
          result.data?.update_risk_controlled_internal_audit_result
            ?.affected_rows === 0
        ) {
          throw new Error('Risk result update failed');
        }
      } else {
        const result = await updateRiskUncontrolledResult({
          variables: {
            ...values,
            CustomAttributeData: values.CustomAttributeData ?? null,
            Id: riskAssessmentResult.Id,
          },
        });
        if (
          result.data?.update_risk_uncontrolled_internal_audit_result
            ?.affected_rows === 0
        ) {
          throw new Error('Risk result update failed');
        }
      }
      riskAssessmentResultIds.push(id!);
    } else {
      const result = await insertRiskInternalAuditResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          InternalAuditReportId: parentId!,
          RiskIds: values?.RiskIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildRiskInternalAuditResult?.Ids) {
        throw new Error('Risk result id is missing');
      }
      riskAssessmentResultIds.push(
        ...result.data.insertChildRiskInternalAuditResult.Ids
      );
    }

    await updateFiles({
      parentIds: riskAssessmentResultIds,
      parentType: parentType,
      selectedFiles: files,
      originalFiles: riskAssessmentResult?.files.map((f) => f.file) ?? [],
    });

    if (navigateToResults && parentId) {
      navigate(internalAuditReportResultsUrl(parentId));
    }
  };

  const value: RiskAssessmentResultFormDataFields | undefined =
    riskAssessmentResult
      ? {
          Rating: riskAssessmentResult.Rating,
          Rationale: riskAssessmentResult.Rationale,
          Likelihood: riskAssessmentResult.Likelihood,
          Impact: riskAssessmentResult.Impact,
          ControlType: controlledRiskAssessmentResult
            ? 'Controlled'
            : 'Uncontrolled',
          InternalAuditReportId: parentId,
          RiskIds: riskIds.map((c) => ({ value: c })),
          TestDate: riskAssessmentResult?.TestDate,
          CustomAttributeData: riskAssessmentResult?.CustomAttributeData,
          files: riskAssessmentResult?.files.map((f) => f.file) ?? [],
        }
      : undefined;

  return (
    <RiskAssessmentResultForm
      header={header}
      defaultValues={{
        ...defaultValues,
        InternalAuditReportId:
          toolsContent === 'wizard' ? wizardAssessmentId : parentId,
        RiskIds: riskIds.map((c) => ({ value: c })),
        ControlType:
          (steps[currentStep]
            ?.controlType as Risk_Assessment_Result_Control_Type_Enum) ||
          defaultValues.ControlType,
      }}
      values={value}
      onSave={onSave}
      readOnly={readonly && !canUpdateRiskAssessmentResult && !canUpdateLoading}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) =>
        isModalForm ? (
          <ModalBodyWrapper {...renderProps} />
        ) : (
          <PageWrapper {...renderProps} />
        )
      }
      disableRiskSelector={id != undefined}
      beforeFieldsSlot={beforeFieldsSlot}
      showSelector={
        showAssessmentSelector ? 'internal_audit_report' : undefined
      }
      assessmentMode={'internal_audit_report'}
    />
  );
};

export default ConnectedRiskInternalAuditResultForm;
