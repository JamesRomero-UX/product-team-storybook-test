import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { FormPreviewButton } from '@risksmart-app/components/src/form-builder/FormPreviewButton';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import ControlledTabs from 'src/components/controlled-tabs/ControlledTabs';
import Loading from 'src/components/loading';

import { useGetQuestionnaireTemplateVersionById } from '@/hooks/queries/questionnaire-template-version/useGetQuestionnaireTemplateVersionById';

import { PageLayout } from '../../../../../../layouts';
import { useTabs } from './useTabs';

interface Props {
  activeTabId: 'details';
}

const QuestionnaireTemplateVersionUpdatePage: FC<Props> = ({ activeTabId }) => {
  const tabs = useTabs();
  const questionnaireTemplateVersionId = useGetGuidParam(
    'questionnaireTemplateVersionId'
  );

  const { data: questionnaireTemplateVersionData, loading } =
    useGetQuestionnaireTemplateVersionById({
      queryArgs: { id: questionnaireTemplateVersionId },
      shouldSkip: !questionnaireTemplateVersionId,
    });

  if (loading) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  if (
    questionnaireTemplateVersionData?.questionnaire_template_version?.Id !==
    questionnaireTemplateVersionId
  ) {
    throw new PageNotFound(
      `Version with id ${questionnaireTemplateVersionId} not found`
    );
  }

  const entity =
    questionnaireTemplateVersionData?.questionnaire_template_version;
  const title = entity?.parent?.Title ? `${entity.parent.Title}` : 'Version';
  const counter = entity?.Version ? `(${entity.Version})` : '';

  return (
    <PageLayout title={title} counter={counter} actions={<FormPreviewButton />}>
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
      />
    </PageLayout>
  );
};

export default QuestionnaireTemplateVersionUpdatePage;
