import { useMutation } from '@apollo/client';
import {
  DeleteAssessmentActivitiesDocument,
  DeleteWizardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { AssessmentTypeEnum } from '../../../types';
import { ActivitiesRegister } from './ActivitiesRegister';
import { RCSAActivitiesRegister } from './RCSAActivitiesRegister';
import { useActivitiesStore } from './store/useActivitiesStore';
import { DeleteTypeEnum } from './types';

const translationKeyPrefix = 'assessmentActivities';

interface Props {
  parent: ObjectWithContributors;
  assessmentMode: AssessmentTypeEnum;
}

const Tab: FC<Props> = ({ parent, assessmentMode }) => {
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: translationKeyPrefix,
  });

  const {
    setIsActivityDeleteModalVisible,
    isActivityDeleteModalVisible,
    setSelectedActivities,
    selectedActivities,
    deleteType,
    selectedRCSAActivities,
    setSelectedRCSAActivities,
  } = useActivitiesStore();

  const [deleteWizardMutation] = useMutation(DeleteWizardDocument);

  const [deleteAssessmentActivities, deleteResult] = useMutation(
    DeleteAssessmentActivitiesDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment_activity');
      },
    }
  );

  const wizardFeatureEnabled = useIsModuleEnabled(
    'risk.subModules.rcsa_wizard'
  );

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (deleteType === DeleteTypeEnum.Activity) {
        await deleteAssessmentActivities({
          variables: { Ids: selectedActivities.map((s) => s.Id) },
        });
        setSelectedActivities([]);
        setIsActivityDeleteModalVisible(false);

        return true;
      } else if (deleteType === DeleteTypeEnum.RCSA) {
        await Promise.all(
          selectedRCSAActivities.map(async (rcsaActivity) => {
            if (!rcsaActivity.RiskId) {
              return;
            }
            await deleteWizardMutation({
              variables: { RiskId: rcsaActivity.RiskId },
            });
          })
        );
        await deleteAssessmentActivities({
          variables: { Ids: selectedRCSAActivities.map((s) => s.Id) },
        });
        setSelectedRCSAActivities([]);
        setIsActivityDeleteModalVisible(false);

        return true;
      }

      return false;
    },
    failureAction: () => {
      setIsActivityDeleteModalVisible(false);
    },
  });

  return (
    <>
      <ActivitiesRegister
        assessmentMode={assessmentMode}
        parent={parent}
      ></ActivitiesRegister>
      {wizardFeatureEnabled && assessmentMode === 'rating' && (
        <RCSAActivitiesRegister parent={parent}></RCSAActivitiesRegister>
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isActivityDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsActivityDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
