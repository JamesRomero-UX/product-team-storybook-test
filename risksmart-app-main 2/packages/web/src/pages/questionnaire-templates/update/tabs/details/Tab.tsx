import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  namedOperations,
  UpdateQuestionnaireTemplateDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { defaultValues } from 'src/components/form/custom-attributes/edit-fields/fieldSchema';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetQuestionnaireTemplateById } from 'src/hooks/queries/questionnaire-template/useGetQuestionnaireTemplateById';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

import { QuestionnaireTemplateForm } from '../../../forms/QuestionnaireTemplateForm';
import type { QuestionnaireTemplateFormData } from '../../../forms/questionnaireTemplateSchema';

const Tab: FC = () => {
  useI18NSummaryHelpContent('questionnaire_templates.help');

  const navigate = useNavigate();

  const questionnaireTemplateId = useGetGuidParam('questionnaireTemplateId');
  const { data, loading: loadingQuestionnaireTemplate } =
    useGetQuestionnaireTemplateById({
      queryArgs: { id: questionnaireTemplateId },
    });

  const questionnaireTemplate = data?.questionnaire_template;

  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery(
      'update:questionnaire_template',
      questionnaireTemplate
    );

  const [mutate] = useMutation(UpdateQuestionnaireTemplateDocument, {
    update: (cache) => {
      evictField(cache, 'questionnaire_template');
      evictField(cache, 'questionnaire_template_by_pk');
    },
    refetchQueries: [
      namedOperations.Query.getQuestionnaireTemplateById,
      namedOperations.Query.getQuestionnaireTemplates,
    ],
  });

  if (!questionnaireTemplate) {
    return null;
  }

  const onSave = async (formData: QuestionnaireTemplateFormData) => {
    if (!data?.questionnaire_template?.Id) {
      throw new Error('Questionnaire template ID is not available');
    }

    await mutate({
      variables: {
        object: {
          Id: data.questionnaire_template.Id,
          Title: formData.Title,
          Description: formData.Description,
          CustomAttributeData: formData.CustomAttributeData,
          ...ownerAndContributorIds(formData),
          DepartmentTypeIds:
            formData.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: formData.tags?.map((t) => t.TagTypeId) || [],
        },
      },
    });
  };

  const onDismiss = () => {
    navigate(-1);
  };

  return (
    <QuestionnaireTemplateForm
      values={{
        ...defaultValues,
        Title: questionnaireTemplate.Title,
        Description: questionnaireTemplate.Description,
        Owners: getOwners(questionnaireTemplate),
        Contributors: getContributors(questionnaireTemplate),
        ancestorContributors: questionnaireTemplate.ancestorContributors,
        tags: questionnaireTemplate.tags,
        departments: questionnaireTemplate.departments,
        CustomAttributeData: questionnaireTemplate.CustomAttributeData,
      }}
      readOnly={!canEdit || canEditLoading || loadingQuestionnaireTemplate}
      onSave={onSave}
      onDismiss={onDismiss}
    />
  );
};

export default Tab;
