import { useMutation, useQuery } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetDocumentInternalAuditResultByIdDocument,
  InsertDocumentInternalAuditResultDocument,
  Parent_Type_Enum,
  UpdateDocumentInternalAuditResultDocument,
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
  documentIds?: string[];
  header?: string;
};

const ConnectedDocumentInternalAuditResultForm: FC<Props> = ({
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
  const { data } = useQuery(GetDocumentInternalAuditResultByIdDocument, {
    variables: {
      Id: id!,
    },
    fetchPolicy: 'no-cache',
    skip: !id,
  });
  const documentInternalAuditResult = data?.document_internal_audit_result?.[0];
  const {
    hasPermission: canUpdateDocumentAssessmentResult,
    loading: isLoadingCanUpdateDocumentAssessmentResult,
  } = useHasPermissionQuery(
    'update:document_internal_audit_result',
    assessedItem
  );

  const { updateFiles } = useMultiParentFileUpdate();
  const [insertDocumentInternalAuditResult] = useMutation(
    InsertDocumentInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'document_internal_audit_result_aggregate');
      },
    }
  );

  const [updateDocumentInternalAuditResult] = useMutation(
    UpdateDocumentInternalAuditResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'document_internal_audit_result_aggregate');
      },
    }
  );

  documentIds = documentIds ?? [];
  const parentDocument = documentInternalAuditResult?.parents.find(
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
    if (documentInternalAuditResult) {
      const result = await updateDocumentInternalAuditResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          Id: documentInternalAuditResult.Id,
        },
      });

      if (
        result.data?.update_document_internal_audit_result?.affected_rows === 0
      ) {
        throw new Error('Document result update failed');
      }
      documentAssessmentResultIds.push(id!);
    } else {
      const result = await insertDocumentInternalAuditResult({
        variables: {
          ...values,
          CustomAttributeData: values.CustomAttributeData ?? null,
          InternalAuditReportId: parentId!,
          DocumentIds: values?.DocumentIds?.map((r) => r.value),
        },
      });

      if (!result.data?.insertChildDocumentInternalAuditResult?.Ids) {
        throw new Error('Document result id is missing');
      }
      documentAssessmentResultIds.push(
        ...result.data.insertChildDocumentInternalAuditResult.Ids
      );
    }

    await updateFiles({
      parentIds: documentAssessmentResultIds,
      parentType: Parent_Type_Enum.DocumentInternalAuditResult,
      selectedFiles: files,
      originalFiles:
        documentInternalAuditResult?.files.map((f) => f.file) ?? [],
    });
    if (navigateToResults && parentId) {
      navigate(internalAuditReportResultsUrl(parentId));
    }
  };

  return (
    <DocumentAssessmentResultForm
      header={header}
      defaultValues={{
        ...defaultValues,
        DocumentIds: documentIds.map((c) => ({ value: c })),
        InternalAuditReportId: parentId,
      }}
      values={
        documentInternalAuditResult
          ? {
              Rating: documentInternalAuditResult?.Rating ?? 1,
              Rationale: documentInternalAuditResult?.Rationale ?? '',
              InternalAuditReportId: parentId,
              DocumentIds: documentIds.map((c) => ({ value: c })),
              TestDate: documentInternalAuditResult?.TestDate,
              CustomAttributeData:
                documentInternalAuditResult?.CustomAttributeData,
              files:
                documentInternalAuditResult?.files.map((f) => f.file) ?? [],
            }
          : undefined
      }
      onDismiss={onDismiss}
      onSave={onSave}
      readOnly={
        readonly &&
        !isLoadingCanUpdateDocumentAssessmentResult &&
        !canUpdateDocumentAssessmentResult
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
        showAssessmentSelector ? 'internal_audit_report' : undefined
      }
      assessmentMode={'internal_audit_report'}
    />
  );
};

export default ConnectedDocumentInternalAuditResultForm;
