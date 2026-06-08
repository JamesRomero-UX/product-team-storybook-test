import { useMutation } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteAssessmentResultsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useWizardStore } from 'src/components/wizard/store/useWizardStore';
import { useGetRiskAssessmentResultsByRiskId } from 'src/hooks/queries';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './riskRatingConfig';
import type { RiskAssessmentResultRegisterFields } from './types';

interface Props {
  risk: ObjectWithContributors;
}

const RiskRatingRegister: FC<Props> = ({ risk }) => {
  useI18NSummaryHelpContent('assessments.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'ratings' });

  const { data, loading, refetch } = useGetRiskAssessmentResultsByRiskId({
    queryArgs: { riskId: risk.Id },
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { currentStep, steps } = useWizardStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (steps[currentStep]?.showModal === 'true') {
      setIsEditOpen(true);
    }
  }, [steps, currentStep]);

  const [selectedAssessmentResults, setSelectedAssessmentResults] = useState<
    RiskAssessmentResultRegisterFields[]
  >([]);

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const {
    hasPermission: userCanDeleteAssessmentResults,
    loading: userCanDeleteAssessmentResultsLoading,
  } = useHasPermissionQuery('delete:risk_assessment_result', risk);

  const [deleteAssessmentResults, deleteResult] = useMutation(
    DeleteAssessmentResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'risk_assessment_result_aggregate');
        evictField(cache, 'risk_score');
      },
    }
  );

  const handleAssessmentResultModalClose = async (saved?: boolean) => {
    if (saved) {
      await refetch();
    }
    setOpenAssessmentResultId(undefined);
    setIsEditOpen(false);
  };

  const onAddRating = () => {
    setIsEditOpen(true);
  };

  const onOpenResult = (id: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };
  const onDelete = useDeleteResultNotification({
    entityName: t('assessmentResults.entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteAssessmentResults({
        variables: {
          Ids: selectedAssessmentResults.map(
            (assessmentResult) => assessmentResult.Id
          ),
        },
      });
      setSelectedAssessmentResults([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
  });

  const tableProps = useGetCollectionTableProps(
    risk,
    onOpenResult,
    onAddRating,
    data?.risk_assessment_result
  );

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Permission
                permission={'delete:risk_assessment_result'}
                parentObject={risk}
              >
                <Button
                  formAction={'none'}
                  variant={'normal'}
                  disabled={
                    !selectedAssessmentResults.length ||
                    !userCanDeleteAssessmentResults ||
                    userCanDeleteAssessmentResultsLoading
                  }
                  onClick={() => setIsDeleteModalVisible(true)}
                >
                  {t('assessmentResults.delete_button')}
                </Button>
              </Permission>
              <Permission
                permission={'insert:risk_assessment_result'}
                parentObject={risk}
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  formAction={'none'}
                  onClick={onAddRating}
                >
                  {t('assessments.add_rating_button')}
                </Button>
              </Permission>
            </SpaceBetween>
          }
        >
          {st('tab_title')}
        </TabHeader>
      </SpaceBetween>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('riskRatingSubheading')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <Table
          {...tableProps}
          selectionType={'multi'}
          selectedItems={selectedAssessmentResults}
          trackBy={'Id'}
          onSelectionChange={({ detail }) => {
            setSelectedAssessmentResults(detail.selectedItems);
          }}
          resizableColumns={true}
          variant={'embedded'}
          loading={loading}
          data-testid={'risk-rating-table'}
        />
      </ExpandableSection>
      {isEditOpen && (
        <AssessmentResultModal
          id={openAssessmentResultId}
          onDismiss={handleAssessmentResultModalClose}
          assessedItem={risk}
          resultType={Parent_Type_Enum.RiskAssessmentResult}
          hideTypeSelector={true}
          i18n={t('ratings')}
          assessmentMode={'rating'}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setOpenAssessmentResultId(undefined);
          setSelectedAssessmentResults([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};
export default RiskRatingRegister;
