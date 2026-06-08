import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { PageLayout } from 'src/layouts';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';

import { useInsertChildIssue } from '@/hooks/mutations';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import IssueForm from '../update/forms/IssueForm';
import IssueTypeSelector from './IssueTypeSelector';

const Page: FC = () => {
  const { updateFiles } = useFileUpdate();
  const navigate = useNavigate();
  const [issueType, setIssueType] = useState<ParentIssueType>(
    Parent_Type_Enum.Issue
  );
  const issueMapping = IssueTypeMapping[issueType];
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueMapping.taxonomy,
  });
  const goldenCharterIssuesEnabled = useIsFeatureFlagEnabled('issue-gc');
  const allicaIssuesEnabled = useIsFeatureFlagEnabled('issue-allica');
  const additionalIssueVariants =
    goldenCharterIssuesEnabled || allicaIssuesEnabled;
  const defaultTitle = st('report_issue_title');

  const { insertChildIssue } = useInsertChildIssue();

  const onSave = async (data: IssueFormDataFields) => {
    const { files } = data;
    const result = await insertChildIssue({
      // Ensure the issue type is set correctly from the selector
      Type: issueType,
      CustomAttributeData: data.CustomAttributeData || undefined,
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      DateIdentified: data.DateIdentified,
      DateOccurred: data.DateOccurred,
      Details: data.Details,
      Title: data.Title,
      ...ownerAndContributorIds(data),
      IsExternalIssue: data.IsExternalIssue,
      ImpactsCustomer: data.ImpactsCustomer,
    });

    const parentId = result.insertChildIssue?.Id;
    const sequentialId = result.insertChildIssue?.SequentialId;
    if (!parentId || !sequentialId) {
      throw new Error('Missing data after issue insertion');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.Issue,
      parentId,
      originalFiles: [],
      selectedFiles: files,
    });
    navigate(issueMapping.reportedSuccessfullyUrl(sequentialId.toString()));
  };

  const beforeIssueSlot = (
    <>
      <div className={'pb-5'}>
        <IssueTypeSelector
          testId={'IssueType'}
          value={issueType}
          readOnly={false}
          onChange={(val) => {
            setIssueType(val);
          }}
        />
      </div>
    </>
  );

  return (
    <PageLayout title={defaultTitle} actions={<></>}>
      <Container header={<Header variant={'h2'}>{t('details')}</Header>}>
        <IssueForm
          onSave={onSave}
          issueType={issueType}
          renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
          beforeFieldsSlot={additionalIssueVariants ? beforeIssueSlot : <></>}
        />
      </Container>
    </PageLayout>
  );
};

export default Page;
