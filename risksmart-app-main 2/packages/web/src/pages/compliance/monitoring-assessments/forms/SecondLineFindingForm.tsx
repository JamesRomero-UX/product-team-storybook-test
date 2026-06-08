import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectedActionForm from 'src/pages/assessments/forms/ConnectedActionForm';
import ConnectedIssueForm from 'src/pages/assessments/forms/ConnectedIssueForm';
import FindingTypeSelector from 'src/pages/assessments/forms/FindingTypeSelector';
import RatingTypeSelector from 'src/pages/assessments/forms/RatingTypeSelector';
import type {
  FormType,
  RatingResultType,
} from 'src/pages/assessments/forms/types';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import ConnectedDocumentSecondLineResultForm from './ConnectedDocumentSecondLineResultForm';
import ConnectedImpactRatingSecondLineResultForm from './ConnectedImpactRatingSecondLineResultForm';
import ConnectedObligationSecondLineResultForm from './ConnectedObligationSecondLineResultForm';
import ConnectedRiskSecondLineResultForm from './ConnectedRiskSecondLineResultForm';
import ConnectedSecondLineControlTestResultForm from './ConnectedSecondLineControlTestResultForm';

interface Props {
  readonly: boolean;
  parentAssessment?: ObjectWithContributors;
  ratingResultType?: RatingResultType;
  formType?: FormType;
  onDismiss?: (saved: boolean) => void;
  assessmentId: string;
  assessmentResultId?: string;
  preselectedAssessedItemIds?: string[];
  showAssessmentSelector: boolean;
  navigateToResults: boolean;
  header: string;
}

const SecondLineFindingForm: FC<Props> = ({
  readonly,
  parentAssessment,
  ratingResultType,
  formType,
  onDismiss,
  assessmentId,
  assessmentResultId,
  preselectedAssessedItemIds,
  showAssessmentSelector,
  navigateToResults,
  header,
}) => {
  const { t } = useTranslation(['common']);
  const [selectedFormType, setFormType] = useState<FormType | undefined>(
    formType
  );
  const [formRatingResultType, setFormResultType] = useState<
    RatingResultType | undefined
  >(ratingResultType);

  const showEarlyCancelButton =
    selectedFormType === undefined ||
    (formRatingResultType === undefined && selectedFormType === 'rating');

  const editingResult =
    assessmentId !== undefined && assessmentResultId !== undefined;
  const beforeAllSlot = (
    <div className={'pb-5'}>
      <FindingTypeSelector
        testId={'type'}
        value={selectedFormType}
        readOnly={readonly || editingResult}
        onChange={(val) => {
          setFormType(val);
        }}
        parent={parentAssessment}
      />
    </div>
  );

  const beforeRatingSlot = (
    <>
      {beforeAllSlot}
      <div className={'pb-5'}>
        <RatingTypeSelector
          testId={'ratingType'}
          value={formRatingResultType}
          readOnly={readonly || editingResult}
          onChange={(val) => {
            setFormResultType(val);
          }}
          parent={parentAssessment}
        />
      </div>
    </>
  );

  return (
    <>
      {!selectedFormType && beforeAllSlot}
      {selectedFormType?.toLocaleLowerCase() === 'rating' && (
        <>
          {!formRatingResultType && beforeRatingSlot}
          {formRatingResultType === Parent_Type_Enum.RiskAssessmentResult && (
            <ConnectedRiskSecondLineResultForm
              header={header}
              readonly={readonly}
              isModalForm={false}
              parentId={assessmentId}
              assessedItem={parentAssessment}
              onDismiss={onDismiss}
              id={assessmentResultId}
              showAssessmentSelector={showAssessmentSelector}
              navigateToResults={navigateToResults}
              riskIds={preselectedAssessedItemIds}
              beforeFieldsSlot={beforeRatingSlot}
            />
          )}

          {formRatingResultType ===
            Parent_Type_Enum.DocumentAssessmentResult && (
            <ConnectedDocumentSecondLineResultForm
              header={header}
              readonly={readonly}
              isModalForm={false}
              parentId={assessmentId}
              assessedItem={parentAssessment}
              onDismiss={onDismiss}
              id={assessmentResultId}
              showAssessmentSelector={showAssessmentSelector}
              navigateToResults={navigateToResults}
              documentIds={preselectedAssessedItemIds}
              beforeFieldsSlot={beforeRatingSlot}
            />
          )}

          {formRatingResultType ===
            Parent_Type_Enum.ObligationAssessmentResult && (
            <ConnectedObligationSecondLineResultForm
              header={header}
              readonly={readonly}
              isModalForm={false}
              parentId={assessmentId}
              assessedItem={parentAssessment}
              onDismiss={onDismiss}
              id={assessmentResultId}
              showAssessmentSelector={showAssessmentSelector}
              navigateToResults={navigateToResults}
              obligationIds={preselectedAssessedItemIds}
              beforeFieldsSlot={beforeRatingSlot}
            />
          )}

          {formRatingResultType === Parent_Type_Enum.TestResult && (
            <ConnectedSecondLineControlTestResultForm
              header={header}
              readonly={readonly}
              parentId={assessmentId}
              assessedItem={parentAssessment}
              onDismiss={onDismiss}
              id={assessmentResultId}
              navigateToResults={navigateToResults}
              controlIds={preselectedAssessedItemIds}
              beforeFieldsSlot={beforeRatingSlot}
            />
          )}
          {formRatingResultType === Parent_Type_Enum.ImpactRating && (
            <ConnectedImpactRatingSecondLineResultForm
              header={header}
              readonly={readonly}
              assessmentId={assessmentId}
              assessedItem={parentAssessment}
              onDismiss={onDismiss}
              id={assessmentResultId}
              navigateToResults={navigateToResults}
              beforeFieldsSlot={beforeRatingSlot}
            />
          )}
        </>
      )}

      {selectedFormType === Parent_Type_Enum.Action && (
        <ConnectedActionForm
          header={header}
          readonly={readonly}
          assessmentId={assessmentId}
          assessedItem={parentAssessment}
          onDismiss={onDismiss}
          id={assessmentResultId}
          assessmentMode={'compliance_monitoring_assessment'}
          showAssessmentSelector={showAssessmentSelector}
          beforeFieldsSlot={beforeAllSlot}
        />
      )}

      {selectedFormType === Parent_Type_Enum.Issue && (
        <ConnectedIssueForm
          header={header}
          readonly={readonly}
          assessmentId={assessmentId}
          assessedItem={parentAssessment}
          onDismiss={onDismiss}
          id={assessmentResultId}
          assessmentMode={'compliance_monitoring_assessment'}
          showAssessmentSelector={showAssessmentSelector}
          beforeFieldsSlot={beforeAllSlot}
        />
      )}

      {showEarlyCancelButton && (
        <SpaceBetween direction={'horizontal'} size={'s'}>
          <Button disabled={true} formAction={'none'} variant={'primary'}>
            {t('save')}
          </Button>

          <Button
            formAction={'none'}
            variant={'normal'}
            onClick={() => onDismiss?.(false)}
          >
            {t('cancel')}
          </Button>
        </SpaceBetween>
      )}
    </>
  );
};

export default SecondLineFindingForm;
