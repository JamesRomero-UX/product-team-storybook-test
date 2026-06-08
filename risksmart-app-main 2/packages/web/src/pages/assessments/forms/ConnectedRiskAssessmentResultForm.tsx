import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import type { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetRiskAssessmentResultByIdDocument,
  Parent_Type_Enum,
  UpdateRiskAssessmentResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useWizardStore } from 'src/components/wizard/store/useWizardStore';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useInsertRiskAssessmentResult } from '@/hooks/mutations/risk-assessment-result';
import { evictField } from '@/utils/graphqlUtils';
import { assessmentResultsUrl } from '@/utils/urls';

import RiskAssessmentResultForm from './RiskAssessmentResultForm';
import type { RiskAssessmentResultFormDataFields } from './riskAssessmentResultSchema';
import { defaultValues } from './riskAssessmentResultSchema';

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

const ConnectedRiskAssessmentResultForm: FC<Props> = ({
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

  const { data } = useQuery(GetRiskAssessmentResultByIdDocument, {
    variables: {
      Id: id!,
    },
    skip: !id,
    fetchPolicy: 'no-cache',
  });
  const riskAssessmentResult = data?.risk_assessment_result?.[0];
  const {
    hasPermission: canUpdateRiskAssessmentResult,
    loading: isLoadingUpdateRiskAssessmentResult,
  } = useHasPermissionQuery('update:risk_assessment_result');

  const { insertRiskAssessmentResult } = useInsertRiskAssessmentResult();

  const [updateRiskAssessmentResult] = useMutation(
    UpdateRiskAssessmentResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'risk_assessment_result_aggregate');
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
      const result = await updateRiskAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          Id: riskAssessmentResult.Id,
        },
      });
      if (result.data?.updateChildRiskAssessmentResult?.affected_rows === 0) {
        throw new Error('Risk assessment result update failed');
      }
      riskAssessmentResultIds.push(id!);
    } else {
      const result = await insertRiskAssessmentResult({
        ...values,
        CustomAttributeData: values.CustomAttributeData ?? null,
        AssessmentId: parentId ?? values.AssessmentId,
        RiskIds: values?.RiskIds?.map((r) => r.value) ?? [],
      });

      if (!result.insertChildRiskAssessmentResult?.Ids) {
        throw new Error('Risk assessment result id is missing');
      }
      riskAssessmentResultIds.push(
        ...result.insertChildRiskAssessmentResult.Ids
      );
    }

    await updateFiles({
      parentIds: riskAssessmentResultIds,
      parentType: Parent_Type_Enum.RiskAssessmentResult,
      selectedFiles: files,
      originalFiles: riskAssessmentResult?.files.map((f) => f.file) ?? [],
    });

    if (navigateToResults && parentId) {
      navigate(assessmentResultsUrl(parentId));
    }
  };

  const value: RiskAssessmentResultFormDataFields | undefined =
    riskAssessmentResult
      ? {
          Rating: riskAssessmentResult.Rating,
          Rationale: riskAssessmentResult.Rationale,
          Likelihood: riskAssessmentResult.Likelihood,
          Impact: riskAssessmentResult.Impact,
          ControlType: riskAssessmentResult?.ControlType,
          AssessmentId:
            riskAssessmentResult.parents.find((p) => p.assessment)?.assessment
              ?.Id ?? null,
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
        AssessmentId: toolsContent === 'wizard' ? wizardAssessmentId : parentId,
        RiskIds: riskIds.map((c) => ({ value: c })),
        ControlType:
          (steps[currentStep]
            ?.controlType as Risk_Assessment_Result_Control_Type_Enum) ||
          defaultValues.ControlType,
      }}
      values={value}
      onSave={onSave}
      readOnly={
        readonly &&
        !canUpdateRiskAssessmentResult &&
        !isLoadingUpdateRiskAssessmentResult
      }
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
      showSelector={showAssessmentSelector ? 'rating' : undefined}
      assessmentMode={'rating'}
    />
  );
};

export default ConnectedRiskAssessmentResultForm;
