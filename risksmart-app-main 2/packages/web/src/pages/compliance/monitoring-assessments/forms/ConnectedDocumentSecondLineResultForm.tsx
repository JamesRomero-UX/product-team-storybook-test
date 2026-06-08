import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetDocumentSecondLineResultByIdDocument,
  InsertDocumentSecondLineResultDocument,
  Parent_Type_Enum,
  UpdateDocumentSecondLineResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import DocumentAssessmentResultForm from 'src/pages/assessments/forms/DocumentAssessmentResultForm';
import type { DocumentAssessmentResultFormDataFields } from 'src/pages/assessments/forms/documentAssessmentResultSchema';
import { defaultValues } from 'src/pages/assessments/forms/documentAssessmentResultSchema';
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
  documentIds?: string[];
  header?: string;
};

const ConnectedDocumentSecondLineResultForm: FC<Props> = ({
  readonly,
  parentId,
  assessedItem,
  id,
  onDismiss,
  beforeFieldsSlot,
  showAssessmentSelector,
  navigateToResults,
  isModalForm,
  documentIds,
  header,
}) => {
  const navigate = useNavigate();

  const { data } = useQuery(GetDocumentSecondLineResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const documentSecondLineResult = data?.document_second_line_result?.[0];
  const {
    hasPermission: canUpdateDocumentSecondLineResult,
    loading: isLoadingCanUpdateDocumentAssessmentResult,
  } = useHasPermissionQuery('update:document_second_line_result', assessedItem);

  const { updateFiles } = useMultiParentFileUpdate();
  const [insertDocumentSecondLineResult] = useMutation(
    InsertDocumentSecondLineResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'document_second_line_result_aggregate');
      },
    }
  );

  const [updateDocumentSecondLineResult] = useMutation(
    UpdateDocumentSecondLineResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'document_second_line_result_aggregate');
      },
    }
  );

  documentIds = documentIds ?? [];
  const parentDocument = documentSecondLineResult?.parents.find(
    (p) => p.document
  );
  if (parentDocument?.document?.Id) {
    documentIds.push(parentDocument.document.Id);
  } else if (assessedItem?.Id) {
    documentIds.push(assessedItem.Id);
  }

  const onSave = async (values: DocumentAssessmentResultFormDataFields) => {
    const { files } = values;
    const documentSecondLineResultIds: string[] = [];
    if (documentSecondLineResult) {
      const result = await updateDocumentSecondLineResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          Id: documentSecondLineResult.Id,
        },
      });

      if (
        result.data?.update_document_second_line_result?.affected_rows === 0
      ) {
        throw new Error('Document second line result update failed');
      }
      documentSecondLineResultIds.push(id!);
    } else {
      const result = await insertDocumentSecondLineResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          ComplianceMonitoringAssessmentId: parentId!,
          DocumentIds: values?.DocumentIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildDocumentSecondLineResult?.Ids) {
        throw new Error('Document second line result id is missing');
      }
      documentSecondLineResultIds.push(
        ...result.data.insertChildDocumentSecondLineResult.Ids
      );
    }

    await updateFiles({
      parentIds: documentSecondLineResultIds,
      parentType: Parent_Type_Enum.DocumentSecondLineResult,
      selectedFiles: files,
      originalFiles: documentSecondLineResult?.files.map((f) => f.file) ?? [],
    });
    if (navigateToResults && parentId) {
      navigate(complianceMonitoringAssessmentResultsUrl(parentId));
    }
  };

  return (
    <DocumentAssessmentResultForm
      header={header}
      defaultValues={{
        ...defaultValues,
        DocumentIds: documentIds.map((c) => ({ value: c })),
        ComplianceMonitoringAssessmentId: parentId,
      }}
      values={
        documentSecondLineResult
          ? {
              Rating: documentSecondLineResult?.Rating ?? 1,
              Rationale: documentSecondLineResult?.Rationale ?? '',
              ComplianceMonitoringAssessmentId: parentId,
              DocumentIds: documentIds.map((c) => ({ value: c })),
              TestDate: documentSecondLineResult?.TestDate,
              CustomAttributeData:
                documentSecondLineResult?.CustomAttributeData,
              files: documentSecondLineResult?.files.map((f) => f.file) ?? [],
            }
          : undefined
      }
      onDismiss={onDismiss}
      onSave={onSave}
      readOnly={
        readonly &&
        !isLoadingCanUpdateDocumentAssessmentResult &&
        !canUpdateDocumentSecondLineResult
      }
      renderTemplate={(renderProps) =>
        isModalForm ? (
          <ModalBodyWrapper {...renderProps} />
        ) : (
          <PageWrapper {...renderProps} />
        )
      }
      disableDocumentSelector={id != undefined}
      beforeFieldsSlot={beforeFieldsSlot}
      showSelector={
        showAssessmentSelector ? 'compliance_monitoring_assessment' : undefined
      }
      assessmentMode={'compliance_monitoring_assessment'}
    />
  );
};

export default ConnectedDocumentSecondLineResultForm;
