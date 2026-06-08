import { useMutation } from '@apollo/client';
import Container from '@risk-smart/themed-cloudscape-components/container';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { InsertQuestionnaireInvitesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useGetThirdPartyById } from 'src/hooks/queries/third-party/useGetThirdPartyById';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { thirdPartyQuestionnairesUrl } from '@/utils/urls';

import { PageLayout } from '../../../../layouts';
import { InvitationForm } from './forms/InvitationForm';
import type { InvitationFields } from './forms/invitationSchema';
import { defaultValues } from './forms/invitationSchema';

const ThirdPartyInvitePage = () => {
  const thirdPartyId = useGetGuidParam('id');
  const navigate = useNavigate();
  const [createInvites] = useMutation(InsertQuestionnaireInvitesDocument, {
    update: (cache) => {
      evictField(cache, 'third_party_response');
    },
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'plan_questionnaire' });

  const { data, loading: loadingThirdParty } = useGetThirdPartyById({
    queryArgs: { thirdPartyId },
  });

  const thirdParty = data?.third_party;
  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery('update:third_party', thirdParty);

  const onDismiss = () => {
    navigate(thirdPartyQuestionnairesUrl(thirdPartyId));
  };

  const onSave = async (data: InvitationFields) => {
    await createInvites({
      variables: {
        thirdPartyId,
        users: data.users.map((u) => u.value),
        questionnaires: data.questionnaires,
        message: data.message,
      },
    });
  };

  return (
    <PageLayout title={t('page_title')}>
      <Container>
        <InvitationForm
          readOnly={!canEdit || canEditLoading || loadingThirdParty}
          values={{
            ...defaultValues,
          }}
          onSave={onSave}
          onDismiss={onDismiss}
        />
      </Container>
    </PageLayout>
  );
};

export default ThirdPartyInvitePage;
