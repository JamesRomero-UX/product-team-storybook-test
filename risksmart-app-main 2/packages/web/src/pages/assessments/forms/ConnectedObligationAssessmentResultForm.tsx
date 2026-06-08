import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetObligationAssessmentResultByIdDocument,
  InsertObligationAssessmentResultDocument,
  Parent_Type_Enum,
  UpdateObligationAssessmentResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { assessmentResultsUrl } from '@/utils/urls';

import ObligationAssessmentResultForm from './ObligationAssessmentResultForm';
import type { ObligationAssessmentResultFormDataFields } from './obligationAssessmentResultSchema';
import { defaultValues } from './obligationAssessmentResultSchema';

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

const ConnectedObligationAssessmentResultForm: FC<Props> = ({
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
  const { data } = useQuery(GetObligationAssessmentResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const obligationAssessmentResult = data?.obligation_assessment_result?.[0];
  const {
    hasPermission: canUpdateObligationAssessmentResult,
    loading: isLoadingCanUpdateObligationAssessmentResult,
  } = useHasPermissionQuery('update:obligation_assessment_result');
  const { updateFiles } = useMultiParentFileUpdate();
  const [insertObligationAssessmentResult] = useMutation(
    InsertObligationAssessmentResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'obligation_assessment_result_aggregate');
      },
    }
  );

  const [updateObligationAssessmentResult] = useMutation(
    UpdateObligationAssessmentResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'obligation_assessment_result_aggregate');
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
        result.data?.update_obligation_assessment_result?.affected_rows === 0
      ) {
        throw new Error('Obligation assessment result update failed');
      }
      obligationAssessmentResultIds.push(id!);
    } else {
      const result = await insertObligationAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          AssessmentId: parentId,
          ObligationIds: values?.ObligationIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildObligationAssessmentResult?.Ids) {
        throw new Error('Obligation assessment result id is missing');
      }
      obligationAssessmentResultIds.push(
        ...result.data.insertChildObligationAssessmentResult.Ids
      );
    }

    await updateFiles({
      parentIds: obligationAssessmentResultIds,
      parentType: Parent_Type_Enum.ObligationAssessmentResult,
      selectedFiles: files,
      originalFiles: obligationAssessmentResult?.files.map((f) => f.file),
    });
    if (navigateToResults && parentId) {
      navigate(assessmentResultsUrl(parentId));
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
              AssessmentId:
                obligationAssessmentResult?.parents.find((p) => p.assessment)
                  ?.assessment?.Id ?? null,
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
      showSelector={showAssessmentSelector ? 'rating' : undefined}
      assessmentMode={'rating'}
    />
  );
};

export default ConnectedObligationAssessmentResultForm;
