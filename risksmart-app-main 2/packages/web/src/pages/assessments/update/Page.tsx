import { Alert } from '@risk-smart/themed-cloudscape-components';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { ActionItem } from 'src/components/actions-button/ActionsButton';
import ActionsButton from 'src/components/actions-button/ActionsButton';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useDeleteAssessment } from '@/hooks/mutations/assessment/useDeleteAssessment';
import { useGetAssessmentById } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import {
  addAssessmentActivityUrl,
  addAssessmentRCSAActivityUrl,
} from '@/utils/urls';

import { useActivitiesStore } from './tabs/activities/store/useActivitiesStore';
import { DeleteTypeEnum } from './tabs/activities/types';
import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'activities'
    | 'details'
    | 'findings'
    | 'impacts'
    | 'linkedItems';
  activityMode?:
    | 'addActivity'
    | 'addRCSA'
    | 'list'
    | 'updateActivity'
    | 'updateRCSA'
    | undefined;
};

const Page: FC<Props> = ({ activeTabId, activityMode = undefined }) => {
  const { t } = useTranslation(['common']);
  const assessmentId = useGetGuidParam('assessmentId');
  const {
    setIsActivityDeleteModalVisible,
    setDeleteType,
    selectedActivities,
    selectedRCSAActivities,
  } = useActivitiesStore();
  const [exportItem, { loading: exporting }] = useExporter(assessmentId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const parentUrl = useGetDetailParentPath(assessmentId);
  const detailsPath = useGetDetailPath(assessmentId);
  const { deleteAssessment, loading: deleteLoading } = useDeleteAssessment();

  const wizardFeatureEnabled = useIsModuleEnabled(
    'risk.subModules.rcsa_wizard'
  );

  const { t: st } = useTranslation(['common'], { keyPrefix: 'assessments' });
  const { data, loading, error } = useGetAssessmentById({
    queryArgs: { Id: assessmentId },
  });
  if (error) {
    throw error;
  }

  const assessment = data?.assessment[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Assessment,
    parent: assessment,
    assessmentActivityMode: activityMode,
    assessmentMode: 'rating',
    hrefRoot: detailsPath,
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity'),
    asyncAction: async () => {
      if (!assessment) {
        return false;
      }
      await deleteAssessment(assessment.Id);
      await navigate(parentUrl);

      return true;
    },
  });

  const {
    hasPermission: canDeleteAssessment,
    loading: canDeleteAssessmentLoading,
  } = useHasPermissionQuery(`delete:assessment`, assessment);
  const {
    hasPermission: canDeleteAssessmentActivities,
    loading: canDeleteAssessmentActivitiesLoading,
  } = useHasPermissionQuery(`delete:assessment_activity`, assessment);
  const {
    hasPermission: canInsertAssessmentActivities,
    loading: canInsertAssessmentActivitiesLoading,
  } = useHasPermissionQuery(`insert:assessment_activity`, assessment);

  if (!loading && !assessment?.Id) {
    throw new PageNotFound(`Assessment with id ${assessmentId} not found`);
  }

  const counter =
    assessment &&
    `(${getFriendlyId(Parent_Type_Enum.Assessment, assessment.SequentialId)})`;
  const fallbackTitle = st('fallback_title');

  const buttons: ActionItem[] = [];

  if (activityMode === 'list') {
    if (
      canInsertAssessmentActivities &&
      !canInsertAssessmentActivitiesLoading
    ) {
      buttons.push({
        text: 'Add Activity',
        id: 'addActivityButton',
        onItemClick: () => {
          navigate(addAssessmentActivityUrl(assessmentId));
        },
      });
    }
    if (
      canDeleteAssessmentActivities &&
      !canDeleteAssessmentActivitiesLoading
    ) {
      buttons.push({
        text: 'Delete Activity',
        id: 'deleteActivityButton',
        onItemClick: () => {
          setDeleteType(DeleteTypeEnum.Activity);
          setIsActivityDeleteModalVisible(true);
        },
        disabled: selectedActivities.length === 0,
      });
    }
    if (wizardFeatureEnabled) {
      if (canInsertAssessmentActivities) {
        buttons.push({
          text: 'Plan RCSA',
          id: 'planRCSAButton',
          onItemClick: () => {
            navigate(addAssessmentRCSAActivityUrl(assessmentId));
          },
        });
      }
      if (
        canDeleteAssessmentActivities &&
        !canDeleteAssessmentActivitiesLoading
      ) {
        buttons.push({
          text: 'Delete RCSA',
          id: 'deleteRCSAButton',
          onItemClick: () => {
            setDeleteType(DeleteTypeEnum.RCSA);
            setIsActivityDeleteModalVisible(true);
          },
          disabled: selectedRCSAActivities.length === 0,
        });
      }
    }
  }

  buttons.push({
    text: t('export.export'),
    id: 'exportAssessmentButton',
    onItemClick: () => {
      exportItem();
    },
    disabled: exporting,
  });

  if (canDeleteAssessment && !canDeleteAssessmentLoading) {
    buttons.push({
      text: 'Delete Assessment',
      id: 'deleteAssessmentButton',
      onItemClick: () => {
        setIsDeleteModalVisible(true);
      },
    });
  }

  const actions =
    buttons.length > 1 ? (
      [
        <ActionsButton
          key={'actions'}
          // TODO: translattion
          buttonText={'Actions'}
          testId={'actionsMenu'}
          items={buttons}
        />,
      ]
    ) : (
      <Button
        variant={'normal'}
        formAction={'none'}
        onClick={buttons[0].onItemClick}
      >
        {buttons[0].text}
      </Button>
    );

  return (
    <PageLayout
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {actions}
        </SpaceBetween>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={assessment?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.Assessment}
        parent={assessment}
      />

      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        <SpaceBetween size={'s'}>
          <Alert type={'warning'} dismissible={false}>
            {st('rscaDeletionWaringMessage')}
          </Alert>
          {st('confirm_delete_message')}
        </SpaceBetween>
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
