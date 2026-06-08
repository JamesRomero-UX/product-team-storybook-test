import { useMutation } from '@apollo/client';
import Loading from '@risksmart-app/components/src/loading';
import {
  InsertQuestionnaireTemplateVersionDocument,
  namedOperations,
  PublishQuestionnaireTemplateVersionDocument,
  Questionnaire_Template_Version_Status_Enum,
  UpdateQuestionnaireTemplateVersionDocument,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import { useGetQuestionnaireTemplateById } from 'src/hooks/queries/questionnaire-template/useGetQuestionnaireTemplateById';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetQuestionnaireTemplateVersionById } from '@/hooks/queries/questionnaire-template-version/useGetQuestionnaireTemplateVersionById';
import { evictField } from '@/utils/graphqlUtils';

import QuestionnaireTemplateVersionForm from '../../../forms/QuestionnaireTemplateVersionForm';
import type { QuestionnaireTemplateVersionFormFieldData } from '../../../forms/questionnaireTemplateVersionSchema';
import { defaultValues } from '../../../forms/questionnaireTemplateVersionSchema';
import { useNextTemplateVersion } from '../../../useNextTemplateVersion';

type TabProps = {
  parentId: string;
  questionnaireTemplateVersionId: string;
};

const Tab = ({ parentId, questionnaireTemplateVersionId }: TabProps) => {
  const { t: st } = useTranslation(['common'], {
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

  const [update] = useMutation(UpdateQuestionnaireTemplateVersionDocument, {
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

  const [publish] = useMutation(PublishQuestionnaireTemplateVersionDocument, {
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

  const { data: questionnaireTemplate, loading: questionnaireTemplateLoading } =
    useGetQuestionnaireTemplateById({ queryArgs: { id: parentId } });

  const [{ nextVersion }, { loading: loadingNextTemplateVersion }] =
    useNextTemplateVersion(parentId);

  const navigate = useNavigate();
  const { hasPermission: canEditPermission, loading: canEditLoading } =
    useHasPermissionQuery(
      'update:questionnaire_template_version',
      questionnaireTemplate?.questionnaire_template,
      false
    );
  const { hasPermission: canCreatePermission, loading: canCreateLoading } =
    useHasPermissionQuery(
      'insert:questionnaire_template_version',
      questionnaireTemplate?.questionnaire_template,
      true
    );

  const { data: questionnaireTemplateVersionData, loading } =
    useGetQuestionnaireTemplateVersionById({
      queryArgs: { id: questionnaireTemplateVersionId },
      shouldSkip: !questionnaireTemplateVersionId,
    });

  const questionnaireTemplateVersion =
    questionnaireTemplateVersionData?.questionnaire_template_version;

  const canModify = questionnaireTemplateVersion
    ? canEditPermission && !canEditLoading
    : canCreatePermission && !canCreateLoading;

  const isDocumentFileDraft = questionnaireTemplateVersion?.Status
    ? questionnaireTemplateVersion?.Status === Version_Status_Enum.Draft
    : true;

  const onSave = async (data: QuestionnaireTemplateVersionFormFieldData) => {
    if (questionnaireTemplateVersion) {
      await update({
        variables: {
          Id: questionnaireTemplateVersion.Id,
          object: data,
        },
        context: {
          headers: {
            'x-confirm-change-request': 'true',
          },
        },
      });
    } else {
      await insert({
        variables: {
          object: {
            ...data,
            Status: Questionnaire_Template_Version_Status_Enum.Draft,
          },
        },
      });
    }
  };

  const onPublish = async (data: QuestionnaireTemplateVersionFormFieldData) => {
    await onSave(data);

    await publish({
      variables: {
        questionnaireTemplateId: parentId,
        questionnaireTemplateVersionId: questionnaireTemplateVersionId,
      },
    });
  };

  const values: QuestionnaireTemplateVersionFormFieldData | undefined =
    questionnaireTemplateVersion
      ? {
          ...defaultValues,
          ...questionnaireTemplateVersion,
        }
      : undefined;

  const defaultValuesWithVersion: QuestionnaireTemplateVersionFormFieldData = {
    ...defaultValues,
    Version: nextVersion,
  };

  const readOnly = !canModify;

  if (
    !questionnaireTemplateVersion ||
    loading ||
    loadingNextTemplateVersion ||
    questionnaireTemplateLoading
  ) {
    return <Loading />;
  }

  const onDismiss = () => {
    navigate(`/third-party/questionnaire/${parentId}/versions`);
  };

  return (
    <>
      <QuestionnaireTemplateVersionForm
        disableStatus={true}
        defaultValues={defaultValuesWithVersion}
        values={values}
        onSave={onSave}
        onPublish={onPublish}
        onDismiss={(saved) => {
          if (saved || readOnly || !isDocumentFileDraft) {
            onDismiss();
          } else {
            setConfirmCloseVisible(true);
          }
        }}
        isCreatingNewEntity={!!questionnaireTemplateVersion}
        readOnly={readOnly}
        savedStatus={questionnaireTemplateVersion.Status}
        parentId={parentId}
      />

      {confirmCloseVisible && (
        <ConfirmModal
          isVisible={true}
          onConfirm={onDismiss}
          onDismiss={() => setConfirmCloseVisible(false)}
          header={st('title')}
        >
          {st('message')}
        </ConfirmModal>
      )}
    </>
  );
};

export default Tab;
