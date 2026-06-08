import { FormPreviewButton } from '@risksmart-app/components/src/form-builder/FormPreviewButton';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs/ControlledTabs';

import { PageLayout } from '../../../../../../layouts';
import DetailsTab from './tabs/details/Tab';

const QuestionnaireTemplateVersionCreatePage: FC = () => {
  const questionnaireTemplateId = useGetGuidParam('questionnaireTemplateId');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions',
  });

  return (
    <PageLayout
      title={st('create_version_page_title')}
      actions={<FormPreviewButton />}
    >
      <ControlledTabs
        activeTabId={'details'}
        tabs={[
          {
            id: 'details',
            label: t('details'),
            content: <DetailsTab parentId={questionnaireTemplateId} />,
          },
        ]}
        variant={'container'}
      />
    </PageLayout>
  );
};

export default QuestionnaireTemplateVersionCreatePage;
