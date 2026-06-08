import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { toTestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';
import { useGetTestResultById, useGetTestResults } from 'src/hooks/queries';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useInsertControlTestResult } from '@/hooks/mutations/test-result/useInsertControlTestResult';
import { useUpdateTestResult } from '@/hooks/mutations/test-result/useUpdateTestResult';
import { useGetControlById } from '@/hooks/queries/control/useGetControlById';

import type { AssessmentTypeEnum } from '../../../assessments/types';
import TestResultForm from '../forms/TestResultForm';
import type { TestResultFormFieldsData } from '../forms/testResultSchema';
import { defaultValues } from '../forms/testResultSchema';

type Props = {
  onDismiss: (saved?: boolean) => void;
  parentControlId: string;
  Id?: string;
  assessmentMode: AssessmentTypeEnum;
};

const TestResultModal: FC<Props> = ({
  onDismiss,
  parentControlId,
  Id,
  assessmentMode,
}) => {
  const { updateFiles } = useFileUpdate();
  const { data: controlData, error } = useGetControlById({
    queryArgs: { controlId: parentControlId },
  });
  if (error) {
    throw error;
  }
  const control = controlData?.control[0];
  const { insertControlTestResult } = useInsertControlTestResult();
  const { updateTestResult: update } = useUpdateTestResult();

  const { data, loading, refetch } = useGetTestResultById({
    queryArgs: { testResultId: Id ?? '' },
    shouldSkip: !Id,
  });
  const { refetch: refetchTestResults } = useGetTestResults({ queryArgs: {} });

  const testResult = data?.test_result[0];
  const {
    hasPermission: canEditTestResult,
    loading: canEditTestResultLoading,
  } = useHasPermissionQuery('update:test_result', control);
  const {
    hasPermission: canCreateTestResult,
    loading: canCreateTestResultLoading,
  } = useHasPermissionQuery('insert:test_result', control);

  const canModify = testResult
    ? canEditTestResult && !canEditTestResultLoading
    : canCreateTestResult && !canCreateTestResultLoading;

  const onSave = async (data: TestResultFormFieldsData) => {
    const { files, ParentControlIds: _, ...rest } = data;
    if (testResult) {
      const result = await update({
        ...rest,
        OriginalTimestamp: testResult.ModifiedAtTimestamp,
        Id: testResult.Id,
        ParentControlId: testResult.ParentControlId,
        CustomAttributeData: rest.CustomAttributeData || undefined,
        Submitter: data.Submitter.value,
      });
      if (!result.updateTestResultApi?.Id) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
      refetch();
    } else {
      const result = await insertControlTestResult({
        ...rest,
        CustomAttributeData: rest.CustomAttributeData || undefined,
        ControlIds: [parentControlId],
        Submitter: data.Submitter.value,
      });
      const ids = result.insertControlTestResult?.Ids;
      if (ids && ids.length > 0) {
        Id = ids[0];
      }
    }
    if (!Id) {
      throw new Error('Id not found');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.TestResult,
      parentId: Id,
      originalFiles: testResult?.files.map((f) => f.file),
      selectedFiles: files,
    });

    refetchTestResults();
  };

  if (loading) {
    return null;
  }

  return (
    <TestResultForm
      values={
        testResult
          ? {
              ...testResult,
              TestType: toTestType(testResult.TestType),
              files: testResult.files.map((rf) => rf.file),
              ParentControlIds: [{ value: parentControlId }],
              Submitter: { value: testResult.Submitter, type: 'user' },
            }
          : undefined
      }
      defaultValues={{
        ...defaultValues,
        ParentControlIds: [{ value: parentControlId }],
      }}
      onSave={onSave}
      onDismiss={onDismiss}
      readOnly={!canModify}
      disableControlSelect={Id !== undefined}
      renderTemplate={(renderProps) => (
        <ModalWrapper
          testId={'testResultModal'}
          {...renderProps}
          visible={true}
        />
      )}
      assessmentMode={assessmentMode}
    />
  );
};

export default TestResultModal;
