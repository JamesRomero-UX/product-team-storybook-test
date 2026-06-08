import { useMutation } from '@apollo/client';
import {
  InsertQuestionnaireTemplateVersionDocument,
  namedOperations,
  Questionnaire_Template_Version_Status_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';

import { evictField } from '@/utils/graphqlUtils';

import QuestionnaireVersionTemplateForm from '../../../forms/QuestionnaireTemplateVersionForm';
import type { QuestionnaireTemplateVersionFormFieldData } from '../../../forms/questionnaireTemplateVersionSchema';
import { defaultValues } from '../../../forms/questionnaireTemplateVersionSchema';
import { useNextTemplateVersion } from '../../../useNextTemplateVersion';

type TabProps = {
  parentId: string;
};

const Tab = ({ parentId }: TabProps) => {
  const { t: qt } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions.confirm_close_modal',
  });

  const [confirmCloseVisible, setConfirmCloseVisible] = useState(false);
  const [insert] = useMutation(InsertQuestionnaireTemplateVersionDocument, {
    update: (cache) => {
      evictField(cache, 'questionnaire_template_version');
      evictField(cache, 'questionnaire_template');
      evictField(cache, 'questionnaire_template_by_pk');
    },
    refetchQueries: [
      namedOperations.Query.getQuestionnaireTemplateById,
      namedOperations.Query.getQuestionnaireTemplates,
    ],
  });

  const [
    { nextVersion, schema, uiSchema },
    { loading: loadingNextTemplateVersion },
  ] = useNextTemplateVersion(parentId);

  const navigate = useNavigate();

  const onSave = async (data: QuestionnaireTemplateVersionFormFieldData) => {
    await insert({
      variables: {
        object: {
          ...data,
          ParentId: parentId,
          Status: Questionnaire_Template_Version_Status_Enum.Draft,
        },
      },
    });
  };

  const defaultValuesWithVersion: QuestionnaireTemplateVersionFormFieldData = {
    ...defaultValues,
    Version: nextVersion,
    Schema: schema,
    UISchema: uiSchema,
  };

  if (loadingNextTemplateVersion) {
    return null;
  }

  const onDismiss = () => {
    navigate(`/third-party/questionnaire/${parentId}/versions`);
  };

  return (
    <>
      <QuestionnaireVersionTemplateForm
        disableStatus={true}
        onSave={onSave}
        onDismiss={(saved) => {
          if (saved) {
            onDismiss();
          } else {
            setConfirmCloseVisible(true);
          }
        }}
        parentId={parentId}
        savedStatus={Version_Status_Enum.Draft}
        isCreatingNewEntity={false}
        defaultValues={defaultValuesWithVersion}
      />

      <ConfirmModal
        isVisible={confirmCloseVisible}
        onConfirm={onDismiss}
        onDismiss={() => setConfirmCloseVisible(false)}
        header={qt('title')}
      >
        {qt('message')}
      </ConfirmModal>
    </>
  );
};

export default Tab;
