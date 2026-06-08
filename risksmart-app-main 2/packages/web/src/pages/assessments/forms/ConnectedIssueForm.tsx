import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useGetIssueById } from 'src/hooks/queries';
import IssueForm from 'src/pages/issues/update/forms/IssueForm';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';
import { defaultValues } from 'src/pages/issues/update/forms/issueSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useInsertChildIssue } from '@/hooks/mutations';

import type { AssessmentTypeEnum } from '../types';
import { useAssessmentTypeConfig } from '../useAssessmentTypeConfig';

type Props = {
  assessmentMode: AssessmentTypeEnum;
  readonly: boolean;
  assessmentId: string;
  assessedItem?: ObjectWithContributors;
  id?: string;
  onDismiss?: (saved: boolean) => void;
  beforeFieldsSlot?: ReactNode;
  showAssessmentSelector?: boolean;
  header?: string;
};

const ConnectedIssueForm: FC<Props> = ({
  readonly,
  assessmentId,
  assessmentMode,
  id,
  onDismiss,
  header,
  beforeFieldsSlot,
}) => {
  const navigate = useNavigate();
  const { data, loading: loadingIssue } = useGetIssueById({
    queryArgs: { id: id! },
    shouldSkip: !id,
  });
  const issue = data?.issue?.[0];
  const {
    routing: { resultsRegisterUrl },
  } = useAssessmentTypeConfig(assessmentMode);

  const { updateFiles } = useFileUpdate();
  const { insertChildIssue } = useInsertChildIssue();

  const onSave = async (values: IssueFormDataFields) => {
    const { files } = values;
    const result = await insertChildIssue({
      CustomAttributeData: values.CustomAttributeData ?? null,
      ParentId: assessmentId,
      DateIdentified: values.DateIdentified,
      DateOccurred: values.DateOccurred,
      DepartmentTypeIds:
        values.departments?.map((t) => t.DepartmentTypeId) || [],
      TagTypeIds: values.tags?.map((t) => t.TagTypeId) || [],
      Details: values.Details,
      Title: values.Title,
      Type: values.Type,
      IsExternalIssue: values.IsExternalIssue,
      ImpactsCustomer: values.ImpactsCustomer,
      ...ownerAndContributorIds(values),
    });

    if (!result.insertChildIssue?.Id) {
      throw new Error('Issue id is missing');
    }

    await updateFiles({
      parentId: result.insertChildIssue?.Id,
      parentType: Parent_Type_Enum.Issue,
      selectedFiles: files,
      originalFiles: issue?.files.map((rf) => rf.file) ?? [],
    });
    navigate(resultsRegisterUrl(assessmentId));
  };

  return (
    <IssueForm
      beforeFieldsSlot={beforeFieldsSlot}
      header={header}
      onDismiss={onDismiss}
      onSave={onSave}
      values={{
        ...defaultValues,
        ...issue,
        files: issue?.files.map((f) => f.file) ?? [],
        Owners: getOwners(issue),
        Contributors: getContributors(issue),
        ancestorContributors: issue?.ancestorContributors ?? [],
      }}
      issueType={Parent_Type_Enum.Issue}
      readOnly={readonly || loadingIssue}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default ConnectedIssueForm;
