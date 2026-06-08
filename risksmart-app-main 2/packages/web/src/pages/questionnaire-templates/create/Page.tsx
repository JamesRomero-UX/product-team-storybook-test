import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';
import { PageLayout } from 'src/layouts';

import useTabs from '@/hooks/useTabs';
import { addQuestionnaireTemplateUrl } from '@/utils/urls';

const Page: FC = () => {
  const { t } = useTranslation(['common']);
  const title = t('questionnaire_templates.create_title');
  const tabs = useTabs({
    parentType: Parent_Type_Enum.QuestionnaireTemplate,
    hrefRoot: addQuestionnaireTemplateUrl(),
    parent: null,
    disabled: true,
  });

  return (
    <PageLayout title={title}>
      <ControlledTabs tabs={tabs} variant={'container'} disableSettings />
    </PageLayout>
  );
};

export default Page;
