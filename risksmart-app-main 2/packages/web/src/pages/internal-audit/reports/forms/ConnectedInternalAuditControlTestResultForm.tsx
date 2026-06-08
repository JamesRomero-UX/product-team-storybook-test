import { useMutation } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { toTestType } from '@risksmart-app/domain/src/types/consts/test-type';
import {
  InsertInternalAuditTestResultDocument,
  Parent_Type_Enum,
  UpdateControlTestInternalAuditResultDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useGetInternalAuditTestResultById } from 'src/hooks/queries';
import TestResultForm from 'src/pages/controls/update/forms/TestResultForm';
import type { TestResultFormFieldsData } from 'src/pages/controls/update/forms/testResultSchema';
import { defaultValues } from 'src/pages/controls/update/forms/testResultSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import type { UserOption } from 'src/schemas/global';

import { evictField } from '@/utils/graphqlUtils';
import { internalAuditReportResultsUrl } from '@/utils/urls';
type Props = {
  readonly: boolean;
  navigateToResults: boolean;
  parentId: string;
  controlTestId?: string;
  assessedItem?: ObjectWithContributors;
  id?: string;
  onDismiss?: (saved: boolean) => void;
  beforeFieldsSlot?: ReactNode;
  controlIds?: string[];
  header?: string;
};

const ConnectedInternalAuditControlTestResultForm: FC<Props> = (props) => {
  const navigate = useNavigate();
  const Id = props.id;
  let Ids: string[] = [];
  if (Id) {
    Ids.push(Id);
  }
  const { data, loading: loadingInternalAuditTestResult } =
    useGetInternalAuditTestResultById({
      queryArgs: { id: Id ?? '' },
      shouldSkip: !Id,
    });

  const testResult = data?.control_test_internal_audit_result[0];
  const { updateFiles } = useMultiParentFileUpdate();

  const [insert] = useMutation(InsertInternalAuditTestResultDocument, {
    update: (cache) => {
      evictField(cache, 'control_test_internal_audit_result');
      evictField(cache, 'control');
      evictField(cache, 'internal_audit_report');
    },
  });

  //TODO: Update correct object.
  const [update] = useMutation(UpdateControlTestInternalAuditResultDocument, {
    update: (cache) => {
      evictField(cache, 'control_test_internal_audit_result');
      evictField(cache, 'control');
      evictField(cache, 'internal_audit_report');
    },
  });

  const onSave = async (data: TestResultFormFieldsData) => {
    const { files, ...rest } = data;
    if (testResult) {
      const { ParentControlIds: _, ...updateData } = rest;
      const { data } = await update({
        variables: {
          object: {
            ...updateData,
            OriginalTimestamp: testResult.ModifiedAtTimestamp,
            Id: testResult.Id,
            ParentControlId: testResult.ParentControlId,
            CustomAttributeData: rest.CustomAttributeData || undefined,
            Submitter: rest.Submitter.value,
          },
        },
      });
      if (!data?.updateControlTestInternalAuditResultApi?.Id) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      const result = await insert({
        variables: {
          ...rest,
          ControlIds: rest.ParentControlIds.map((p) => p.value),
          InternalAuditReportId: props.parentId,
          CustomAttributeData: rest.CustomAttributeData || undefined,
          Submitter: rest.Submitter.value,
        },
      });
      if (!result.data?.insertChildControlTestInternalAuditResult?.Ids) {
        throw new Error('Id not found');
      }
      Ids = result.data?.insertChildControlTestInternalAuditResult?.Ids;
    }
    if (!Ids) {
      throw new Error('Id not found');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.ControlTestInternalAuditResult,
      parentIds: Ids,
      originalFiles: testResult?.files.map((f) => f.file),
      selectedFiles: files,
    });
    if (props.navigateToResults) {
      navigate(internalAuditReportResultsUrl(props.parentId));
    }
  };

  return (
    <div className={'pb-5'}>
      <TestResultForm
        {...props}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
        defaultValues={{
          ...defaultValues,
        }}
        assessmentMode={'internal_audit_report'}
        values={{
          ...defaultValues,
          ...testResult,
          TestType: toTestType(testResult?.TestType),
          files: testResult?.files.map((rf) => rf.file) ?? [],
          Submitter: testResult?.Submitter
            ? { value: testResult.Submitter, type: 'user' }
            : (undefined as unknown as UserOption),
          ParentControlIds: testResult
            ? [{ value: testResult.ParentControlId }]
            : props.controlIds
              ? props.controlIds.map((c) => ({
                  value: c,
                }))
              : [],
        }}
        onSave={onSave}
        onDismiss={props.onDismiss}
        readOnly={props.readonly || loadingInternalAuditTestResult}
        disableControlSelect={props.id !== undefined}
      />
    </div>
  );
};

export default ConnectedInternalAuditControlTestResultForm;
