import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { GetQuestionnaireTemplateByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import TabHeader from 'src/components/tab-header';
import { Permission } from 'src/rbac/Permission';

import { useGetQuestionnaireTemplateVersionsByQuestionnaireTemplateId } from '@/hooks/queries/questionnaire-template-version/useGetQuestionnaireTemplateVersionsByQuestionnaireTemplateId';

import { useGetCollectionTableProps } from './config';

const Tab: FC = () => {
  const questionnaireTemplateId = useGetGuidParam('questionnaireTemplateId');

  const navigate = useNavigate();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions',
  });

  const { data: questionnaireTemplate, loading: questionnaireTemplateLoading } =
    useQuery(GetQuestionnaireTemplateByIdDocument, {
      variables: { Id: questionnaireTemplateId },
    });

  const { data, loading } =
    useGetQuestionnaireTemplateVersionsByQuestionnaireTemplateId({
      queryArgs: { parentId: questionnaireTemplateId },
    });

  const handleCreateNew = () => {
    navigate('create');
  };

  const tableProps = useGetCollectionTableProps(
    data?.questionnaire_template_version,
    questionnaireTemplate?.questionnaire_template
  );

  return (
    <>
      <Table
        {...tableProps}
        variant={'embedded'}
        loading={loading || questionnaireTemplateLoading}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'insert:questionnaire_template_version'}
                    parentObject={questionnaireTemplate?.questionnaire_template}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      iconName={'upload'}
                      onClick={handleCreateNew}
                    >
                      {st('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
      />
    </>
  );
};

export default Tab;
