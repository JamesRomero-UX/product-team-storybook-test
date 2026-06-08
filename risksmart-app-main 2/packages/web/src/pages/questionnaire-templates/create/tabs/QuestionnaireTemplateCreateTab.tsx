import { useMutation } from '@apollo/client';
import { InsertQuestionnaireTemplateDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';

import { evictField } from '@/utils/graphqlUtils';
import { questionnaireTemplateVersionCreateUrl } from '@/utils/urls';

import { QuestionnaireTemplateForm } from '../../forms/QuestionnaireTemplateForm';
import type { QuestionnaireTemplateFormData } from '../../forms/questionnaireTemplateSchema';

const QuestionnaireTemplateCreateTab: FC = () => {
  useI18NSummaryHelpContent('questionnaire_templates.help');
  const navigate = useNavigate();
  const [mutate] = useMutation(InsertQuestionnaireTemplateDocument, {
    update: (cache) => {
      evictField(cache, 'questionnaire_template');
    },
  });

  const onSave = async (data: QuestionnaireTemplateFormData) => {
    const { data: result } = await mutate({
      variables: {
        object: {
          CustomAttributeData: data.CustomAttributeData || undefined,
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
          Description: data.Description,
          Title: data.Title,
          ...ownerAndContributorIds(data),
        },
      },
    });

    if (result?.insertQuestionnaireTemplateApi?.Id) {
      navigate(
        questionnaireTemplateVersionCreateUrl(
          result?.insertQuestionnaireTemplateApi?.Id
        ),
        {
          replace: true,
        }
      );
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return <QuestionnaireTemplateForm onSave={onSave} onDismiss={onDismiss} />;
};

export default QuestionnaireTemplateCreateTab;
