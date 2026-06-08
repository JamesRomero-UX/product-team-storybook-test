import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetIssueById } from 'src/hooks/queries';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';
import { defaultValues } from 'src/pages/issues/update/forms/issueSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useUpdateIssue } from '@/hooks/mutations/issue';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { issueRegisterUrl } from '../../../../../utils/urls';
import IssueForm from '../../forms/IssueForm';

interface Props {
  type: ParentIssueType;
}

const Tab: FC<Props> = ({ type }) => {
  const issueMapping = IssueTypeMapping[type];
  useI18NSummaryHelpContent(`${issueMapping.taxonomy}.help`);
  const issueId = useGetGuidParam('issueId');
  const { t } = useTranslation(['common']);

  const {
    data,
    refetch,
    error,
    loading: loadingIssue,
  } = useGetIssueById({
    queryArgs: { id: issueId! },
    shouldSkip: !issueId,
  });
  if (error) {
    throw error;
  }
  const navigate = useNavigate();
  const issue = data?.issue?.[0];
  const { hasPermission: canEditIssue, loading: canEditIssueLoading } =
    useHasPermissionQuery('update:issue', issue);
  const { hasPermission: canCreateIssue, loading: canCreateIssueLoading } =
    useHasPermissionQuery('insert:issue', issue);
  const { updateFiles } = useFileUpdate();
  const { updateIssue } = useUpdateIssue({ issueType: type });

  const values = {
    ...defaultValues,
    ...issue,
    files: issue?.files.map((rf) => rf.file) ?? [],
    Owners: getOwners(issue),
    Contributors: getContributors(issue),
    ancestorContributors: issue?.ancestorContributors ?? [],
  };
  const canModify = issue
    ? canEditIssue && !canEditIssueLoading
    : canCreateIssue && !canCreateIssueLoading;

  const onSave = async (data: IssueFormDataFields) => {
    const { files } = data;
    if (!issue) {
      throw new Error('Missing issue');
    }
    await updateIssue({
      OriginalTimestamp: issue.ModifiedAtTimestamp,
      Id: issue.Id,
      CustomAttributeData: data.CustomAttributeData || undefined,
      DateIdentified: data.DateIdentified,
      DateOccurred: data.DateOccurred,
      Details: data.Details,
      Title: data.Title,
      ...ownerAndContributorIds(data),
      IsExternalIssue: data.IsExternalIssue,
      ImpactsCustomer: data.ImpactsCustomer,
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
    });
    await updateFiles({
      parentType: Parent_Type_Enum.Issue,
      parentId: issue?.Id,
      originalFiles: values?.files,
      selectedFiles: files,
    });
    await refetch();
  };

  const onDeleteApproved = useCallback(() => {
    navigate(issueRegisterUrl());
  }, [navigate]);

  const onDismiss = () => {
    return navigate(-1);
  };
  if (!issue) {
    return <></>;
  }

  return (
    <IssueForm
      readOnly={!canModify || loadingIssue}
      header={t('details')}
      onDismiss={onDismiss}
      onSave={onSave}
      values={values}
      issueType={type}
      onDeleteApproved={onDeleteApproved}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default Tab;
