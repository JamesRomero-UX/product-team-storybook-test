import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { toTestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useGetTestResultById } from 'src/hooks/queries';
import TestResultForm from 'src/pages/controls/update/forms/TestResultForm';
import type { TestResultFormFieldsData } from 'src/pages/controls/update/forms/testResultSchema';
import { defaultValues } from 'src/pages/controls/update/forms/testResultSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import type { UserOption } from 'src/schemas/global';

import { useInsertControlTestResult } from '@/hooks/mutations/test-result/useInsertControlTestResult';
import { useUpdateTestResult } from '@/hooks/mutations/test-result/useUpdateTestResult';
import { assessmentResultsUrl } from '@/utils/urls';
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

const ConnectedControlTestResultForm: FC<Props> = (props) => {
  const navigate = useNavigate();
  const Id = props.id;
  let Ids: string[] = [];
  if (Id) {
    Ids.push(Id);
  }
  const { data, loading: loadingTestResult } = useGetTestResultById({
    queryArgs: { testResultId: Id ?? '' },
    shouldSkip: !Id,
  });
  const testResult = data?.test_result[0];
  const { updateFiles } = useMultiParentFileUpdate();

  const { insertControlTestResult } = useInsertControlTestResult();
  const { updateTestResult: update } = useUpdateTestResult();

  const onSave = async (data: TestResultFormFieldsData) => {
    const { files, ...rest } = data;
    if (testResult) {
      const { ParentControlIds: _, ...updateData } = rest;
      const result = await update({
        ...updateData,
        OriginalTimestamp: testResult.ModifiedAtTimestamp,
        Id: testResult.Id,
        ParentControlId: testResult.ParentControlId,
        CustomAttributeData: rest.CustomAttributeData || undefined,
        Submitter: rest.Submitter.value,
      });
      if (!result.updateTestResultApi?.Id) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      const result = await insertControlTestResult({
        ...rest,
        ControlIds: rest.ParentControlIds.map((p) => p.value),
        AssessmentId: props.parentId,
        CustomAttributeData: rest.CustomAttributeData || undefined,
        Submitter: rest.Submitter.value,
      });
      if (!result.insertControlTestResult?.Ids) {
        throw new Error('Id not found');
      }
      Ids = result.insertControlTestResult?.Ids;
    }
    if (!Ids) {
      throw new Error('Id not found');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.TestResult,
      parentIds: Ids,
      originalFiles: testResult?.files.map((f) => f.file),
      selectedFiles: files,
    });
    if (props.navigateToResults) {
      navigate(assessmentResultsUrl(props.parentId));
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
        assessmentMode={'rating'}
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
        readOnly={props.readonly || loadingTestResult}
        disableControlSelect={props.id !== undefined}
      />
    </div>
  );
};

export default ConnectedControlTestResultForm;
