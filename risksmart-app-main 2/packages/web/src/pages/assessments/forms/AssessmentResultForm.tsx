import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import type { ResultType } from '../modals/types';
import ConnectedDocumentAssessmentResultForm from './ConnectedDocumentAssessmentResultForm';
import ConnectedObligationAssessmentResultForm from './ConnectedObligationAssessmentResultForm';
import ConnectedRiskAssessmentResultForm from './ConnectedRiskAssessmentResultForm';
import TypeSelector from './TypeSelector';

export interface Props {
  readonly: boolean;
  navigateToResults: boolean;
  parentAssessment?: ObjectWithContributors;
  assessedItem?: ObjectWithContributors;
  resultType?: ResultType;
  onDismiss?: (saved: boolean) => void;
  hideTypeSelector?: boolean;
  id?: string;
}

const AssessmentResultForm: FC<Props> = ({
  readonly,
  parentAssessment,
  assessedItem,
  resultType,
  onDismiss,
  hideTypeSelector,
  id,
  navigateToResults,
}) => {
  const [formResultType, setFormResultType] = useState<ResultType>(
    resultType || Parent_Type_Enum.RiskAssessmentResult
  );

  const [assessment] = useState<ObjectWithContributors | undefined>(
    parentAssessment
  );

  const typeSelector = (
    <div className={'pb-5'}>
      <TypeSelector
        testId={'Type'}
        value={formResultType}
        readOnly={readonly}
        onChange={(val) => {
          setFormResultType(val);
        }}
        parent={parentAssessment}
      />
    </div>
  );

  const beforeFieldsSlot = <>{!hideTypeSelector && typeSelector}</>;

  return (
    <>
      {formResultType === Parent_Type_Enum.RiskAssessmentResult && (
        <ConnectedRiskAssessmentResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parentAssessment}
          navigateToResults={navigateToResults}
        />
      )}

      {formResultType === Parent_Type_Enum.DocumentAssessmentResult && (
        <ConnectedDocumentAssessmentResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parentAssessment}
          navigateToResults={navigateToResults}
        />
      )}

      {formResultType === Parent_Type_Enum.ObligationAssessmentResult && (
        <ConnectedObligationAssessmentResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parentAssessment}
          navigateToResults={navigateToResults}
        />
      )}
    </>
  );
};

export default AssessmentResultForm;
