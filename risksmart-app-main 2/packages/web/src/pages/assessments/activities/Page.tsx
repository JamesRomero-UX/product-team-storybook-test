import { useMutation } from '@apollo/client';
import Container from '@risk-smart/themed-cloudscape-components/container';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import {
  DeleteAssessmentActivitiesDocument,
  DeleteWizardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionsButton from 'src/components/actions-button/ActionsButton';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useCombineTableProps } from '@/components/customisable-ribbon/hooks/useCombineTableProps';
import { useGetAssessmentActivitiesRegister } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps as useGetActivitiesCollectionTableProps } from '../update/tabs/activities/activtiesConfig';
import { useGetCollectionTableProps as useGetRCSACollectionTableProps } from '../update/tabs/activities/RCSAConfig';
import type {
  AssessmentActivityFields,
  AssessmentRCSAActivityFields,
} from '../update/tabs/activities/types';
import { DeleteTypeEnum } from '../update/tabs/activities/types';
import { useGetDefaultRibbonFilters } from './defaultRibbonFilters';
import { useFilterStore } from './useFilterStore';

type ActivityItemType = AssessmentActivityFields;
type RCSAActivityItemType = AssessmentRCSAActivityFields;

const Page: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const { t: st } = useTranslation(['common']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteTypeEnum>();
  const [selectedActivities, setSelectedActivities] = useState<
    ActivityItemType[]
  >([]);
  const [selectedRCSAActivities, setSelectedRCSAActivities] = useState<
    RCSAActivityItemType[]
  >([]);

  const {
    hasPermission: canDeleteAssessmentActivities,
    loading: isLoadingDeleteAssessmentActivities,
  } = useHasPermissionQuery(`delete:assessment_activity`);

  const { data, loading, refetch } = useGetAssessmentActivitiesRegister({
    queryArgs: {},
  });

  const [deleteWizardMutation] = useMutation(DeleteWizardDocument);

  const [deleteActivities, deleteResult] = useMutation(
    DeleteAssessmentActivitiesDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment_activity');
        refetch();
      },
    }
  );

  const activitiesTableProps = useGetActivitiesCollectionTableProps(
    'rating',
    data?.assessment_activity.filter((activity) => activity.IsRCSA === false)
  );

  const RCSATableProps = useGetRCSACollectionTableProps(
    data?.assessment_activity.filter((activity) => activity.IsRCSA === true)
  );

  const { RCSAActivityFilter } = useFilterStore();

  useEffect(() => {
    RCSATableProps.actions.setPropertyFiltering(RCSAActivityFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wizardFeatureEnabled = useIsModuleEnabled(
    'risk.subModules.rcsa_wizard'
  );

  const activitiesCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.assessment_activity.length})`;
  }, [loading, data]);

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      if (deleteType === DeleteTypeEnum.Activity) {
        await deleteActivities({
          variables: { Ids: selectedActivities.map((s) => s.Id) },
        });
        setSelectedActivities([]);
        setIsDeleteModalVisible(false);

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
        await deleteActivities({
          variables: { Ids: selectedRCSAActivities.map((s) => s.Id) },
        });
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
        setSelectedRCSAActivities([]);
        setIsDeleteModalVisible(false);

        return true;
      }

      return false;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const combinedProps = useCombineTableProps(
    activitiesTableProps,
    RCSATableProps
  );

  const buttons = [];

  if (!isLoadingDeleteAssessmentActivities && canDeleteAssessmentActivities) {
    buttons.push({
      text: t('delete_activity_button'),
      id: 'deleteActivityButton',
      onItemClick: () => {
        setDeleteType(DeleteTypeEnum.Activity);
        setIsDeleteModalVisible(true);
      },
      disabled: selectedActivities.length === 0,
    });
    if (wizardFeatureEnabled) {
      buttons.push({
        text: t('delete_rcsa_button'),
        id: 'deleteRCSAButton',
        onItemClick: () => {
          setDeleteType(DeleteTypeEnum.RCSA);
          setIsDeleteModalVisible(true);
        },
        disabled: selectedRCSAActivities.length === 0,
      });
    }
  }

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = t('register_title');

  return (
    <PageLayout
      title={title}
      counter={activitiesCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={activitiesTableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <ActionsButton
            key={'actions'}
            buttonText={st('actionsButton')}
            items={buttons}
          />
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={combinedProps.allItems}
        propertyFilterQuery={combinedProps.propertyFilterQuery}
        onFilterQueryChanged={combinedProps.actions.setPropertyFiltering}
        filteringProperties={combinedProps.filteringProperties}
        filteringOptions={combinedProps.propertyFilterProps.filteringOptions}
        parentType={ParentTypes.AssessmentActivity}
        {...ribbonProps}
      />
      <Container header={<h2>{t('tab_title')}</h2>} variant={'default'}>
        <ExpandableSection
          headerText={
            <div className={'flex space-x-2'}>
              <span className={'m-0'}>{t('activityRegisterTitle')}</span>
              <span className={'text-grey font-normal'}>
                {getCounter(activitiesTableProps.totalItemsCount ?? 0, loading)}
              </span>
            </div>
          }
          defaultExpanded={true}
        >
          <Table
            {...activitiesTableProps}
            selectionType={
              !isLoadingDeleteAssessmentActivities &&
              canDeleteAssessmentActivities
                ? 'multi'
                : undefined
            }
            selectedItems={selectedActivities}
            trackBy={'Id'}
            onSelectionChange={({ detail }) => {
              setSelectedActivities(detail.selectedItems);
            }}
            variant={'embedded'}
            loading={loading}
          />
        </ExpandableSection>
        {wizardFeatureEnabled && (
          <ExpandableSection
            headerText={
              <div className={'flex space-x-2'}>
                <span className={'m-0'}>{t('rcsaActivityRegisterTitle')}</span>
                <span className={'text-grey font-normal'}>
                  {getCounter(RCSATableProps.totalItemsCount ?? 0, loading)}
                </span>
              </div>
            }
            defaultExpanded={true}
          >
            <Table
              {...RCSATableProps}
              selectionType={
                !isLoadingDeleteAssessmentActivities &&
                canDeleteAssessmentActivities
                  ? 'multi'
                  : undefined
              }
              selectedItems={selectedRCSAActivities}
              trackBy={'Id'}
              onSelectionChange={({ detail }) => {
                setSelectedRCSAActivities(detail.selectedItems);
              }}
              variant={'embedded'}
              loading={loading}
            />
          </ExpandableSection>
        )}
      </Container>
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
