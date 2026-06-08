import { nextTemplateVersion } from '@risksmart-app/shared/third-party/questionnaire-templates/templateVersionUtils';

import { useGetLatestQuestionnaireTemplateVersion } from '@/hooks/queries/questionnaire-template-version/useGetLatestQuestionnaireTemplateVersion';

export const useNextTemplateVersion = (
  parentId: string
): [
  {
    nextVersion: string;
    schema: Record<string, unknown>;
    uiSchema: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customAttributeData: any;
  },
  { loading: boolean },
] => {
  const { data, loading } = useGetLatestQuestionnaireTemplateVersion({
    queryArgs: { parentId },
  });

  const previousVersion =
    data?.questionnaire_template_version.length === 1
      ? data?.questionnaire_template_version[0]
      : undefined;

  const nextVersion = nextTemplateVersion(previousVersion?.Version);

  return [
    {
      nextVersion,
      schema: previousVersion?.Schema,
      uiSchema: previousVersion?.UISchema,
      customAttributeData: previousVersion?.CustomAttributeData,
    },
    { loading },
  ];
};
