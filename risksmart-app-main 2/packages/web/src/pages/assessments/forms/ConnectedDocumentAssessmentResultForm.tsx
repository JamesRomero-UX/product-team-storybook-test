import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetDocumentAssessmentResultByIdDocument,
  InsertDocumentAssessmentResultDocument,
  Parent_Type_Enum,
  UpdateDocumentAssessmentResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ModalBodyWrapper } from 'src/components/form/form/ModalBodyWrapper';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { assessmentResultsUrl } from '@/utils/urls';

import DocumentAssessmentResultForm from './DocumentAssessmentResultForm';
import type { DocumentAssessmentResultFormDataFields } from './documentAssessmentResultSchema';
import { defaultValues } from './documentAssessmentResultSchema';

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

const ConnectedDocumentAssessmentResultForm: FC<Props> = ({
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

  const { data } = useQuery(GetDocumentAssessmentResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const documentAssessmentResult = data?.document_assessment_result?.[0];
  const {
    hasPermission: canUpdateDocumentAssessmentResult,
    loading: isLoadingUpdateDocumentAssessmentResult,
  } = useHasPermissionQuery('update:document_assessment_result');

  const { updateFiles } = useMultiParentFileUpdate();
  const [insertDocumentAssessmentResult] = useMutation(
    InsertDocumentAssessmentResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'document_assessment_result_aggregate');
      },
    }
  );

  const [updateDocumentAssessmentResult] = useMutation(
    UpdateDocumentAssessmentResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'document_assessment_result_aggregate');
      },
    }
  );

  documentIds = documentIds ?? [];
  const parentDocument = documentAssessmentResult?.parents.find(
    (p) => p.document
  );
  if (parentDocument?.document?.Id) {
    documentIds.push(parentDocument.document.Id);
  } else if (assessedItem?.Id) {
    documentIds.push(assessedItem.Id);
  }

  const onSave = async (values: DocumentAssessmentResultFormDataFields) => {
    const { files } = values;
    const documentAssessmentResultIds: string[] = [];
    if (documentAssessmentResult) {
      const result = await updateDocumentAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          Id: documentAssessmentResult.Id,
        },
      });

      if (result.data?.update_document_assessment_result?.affected_rows === 0) {
        throw new Error('Document assessment result update failed');
      }
      documentAssessmentResultIds.push(id!);
    } else {
      const result = await insertDocumentAssessmentResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          AssessmentId: parentId,
          DocumentIds: values?.DocumentIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildDocumentAssessmentResult?.Ids) {
        throw new Error('Document assessment result id is missing');
      }
      documentAssessmentResultIds.push(
        ...result.data.insertChildDocumentAssessmentResult.Ids
      );
    }

    await updateFiles({
      parentIds: documentAssessmentResultIds,
      parentType: Parent_Type_Enum.DocumentAssessmentResult,
      selectedFiles: files,
      originalFiles: documentAssessmentResult?.files.map((f) => f.file) ?? [],
    });
    if (navigateToResults && parentId) {
      navigate(assessmentResultsUrl(parentId));
    }
  };

  return (
    <DocumentAssessmentResultForm
      header={header}
      defaultValues={{
        ...defaultValues,
        DocumentIds: documentIds.map((c) => ({ value: c })),
        AssessmentId: parentId ?? null,
      }}
      values={
        documentAssessmentResult
          ? {
              Rating: documentAssessmentResult?.Rating ?? 1,
              Rationale: documentAssessmentResult?.Rationale ?? '',
              AssessmentId:
                documentAssessmentResult?.parents.find((p) => p.assessment)
                  ?.assessment?.Id ?? null,
              DocumentIds: documentIds.map((c) => ({ value: c })),
              TestDate: documentAssessmentResult?.TestDate,
              CustomAttributeData:
                documentAssessmentResult?.CustomAttributeData,
              files: documentAssessmentResult?.files.map((f) => f.file) ?? [],
            }
          : undefined
      }
      onDismiss={onDismiss}
      onSave={onSave}
      readOnly={
        readonly &&
        (isLoadingUpdateDocumentAssessmentResult ||
          !canUpdateDocumentAssessmentResult)
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
      showSelector={showAssessmentSelector ? 'rating' : undefined}
      assessmentMode={'rating'}
    />
  );
};

export default ConnectedDocumentAssessmentResultForm;
