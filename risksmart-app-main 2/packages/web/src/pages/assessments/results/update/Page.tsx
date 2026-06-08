import {
  useGetGuidParam,
  useGetOptionalGuidParam,
} from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';
import { PageLayout } from 'src/layouts';

import { useGetAssessmentResultById } from '@/hooks/queries';
import { useGetAssessmentById } from '@/hooks/queries/assessment/useGetAssessmentById';

import { useTabs } from '../../../assessment-results/update/useTabs';

const Page: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const title = t('edit_title');
  const optionalAssessmentId = useGetOptionalGuidParam('assessmentId');
  const findingId = useGetGuidParam('findingId');
  const { data: resultData, error: resultError } = useGetAssessmentResultById({
    queryArgs: { id: findingId ?? '' },
    shouldSkip: !!optionalAssessmentId,
  });
  if (resultError) {
    throw resultError;
  }
  const resultParentId = resultData?.assessment_result_parent.find(
    (ar) => ar.ParentType == Parent_Type_Enum.Assessment
  )?.ParentId;
  const assessmentId = optionalAssessmentId ?? resultParentId;
  const { data, error } = useGetAssessmentById({
    queryArgs: {
      Id: assessmentId!,
    },
    shouldSkip: !assessmentId,
  });
  if (error) {
    throw error;
  }

  const assessment = data?.assessment?.[0];
  const tabs = useTabs(
    assessment || undefined,
    'update',
    !optionalAssessmentId,
    !!optionalAssessmentId
  );

  return (
    <PageLayout title={title}>
      <ControlledTabs tabs={tabs} variant={'container'} parent={assessment} />
    </PageLayout>
  );
};

export default Page;
