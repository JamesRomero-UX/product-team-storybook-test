import { useMutation } from '@apollo/client';
import { SpaceBetween } from '@risk-smart/themed-cloudscape-components';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteQuestionnaireTemplateDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { useGetQuestionnaireTemplateById } from 'src/hooks/queries/questionnaire-template/useGetQuestionnaireTemplateById';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { evictField } from '@/utils/graphqlUtils';

import {
  useGetDetailParentPath,
  useGetDetailPath,
} from '../../../routes/useGetDetailParentPath';

interface Props {
  activeTabId?: 'details' | 'versions';
}

const Page: FC<Props> = ({ activeTabId }: Props) => {
  const questionnaireTemplateId = useGetGuidParam('questionnaireTemplateId');
  const entityUrl = useGetDetailPath(questionnaireTemplateId);
  const parentUrl = useGetDetailParentPath(questionnaireTemplateId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { data } = useGetQuestionnaireTemplateById({
    queryArgs: { id: questionnaireTemplateId },
  });

  const navigate = useNavigate();

  const title = data?.questionnaire_template?.Title || '';
  const tabs = useTabs({
    parentType: Parent_Type_Enum.QuestionnaireTemplate,
    hrefRoot: entityUrl,
    parent: null,
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_templates',
  });

  const [mutate, deleteResult] = useMutation(
    DeleteQuestionnaireTemplateDocument,
    {
      update: (cache) => {
        evictField(cache, 'questionnaire_template');
        evictField(cache, 'questionnaire_template_by_pk');
      },
    }
  );

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!data) {
        throw new Error('Data is not available');
      }

      await mutate({
        variables: {
          Id: questionnaireTemplateId,
        },
      });

      await navigate(parentUrl);

      return true;
    },
  });

  return (
    <PageLayout
      title={title}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission
            permission={'delete:questionnaire_template'}
            parentObject={data?.questionnaire_template}
          >
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => setIsDeleteModalVisible(true)}
            >
              {st('delete_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
        size={'medium'}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
