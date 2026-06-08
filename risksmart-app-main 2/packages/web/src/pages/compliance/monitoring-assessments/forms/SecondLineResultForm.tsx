import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import TypeSelector from 'src/pages/assessments/forms/TypeSelector';
import type { ResultType } from 'src/pages/assessments/modals/types';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import ConnectedDocumentSecondLineResultForm from './ConnectedDocumentSecondLineResultForm';
import ConnectedObligationSecondLineResultForm from './ConnectedObligationSecondLineResultForm';
import ConnectedRiskSecondLineResultForm from './ConnectedRiskSecondLineResultForm';

export interface Props {
  readonly: boolean;
  navigateToResults: boolean;
  parent?: ObjectWithContributors;
  assessedItem?: ObjectWithContributors;
  resultType?: ResultType;
  onDismiss?: (saved: boolean) => void;
  hideTypeSelector?: boolean;
  id?: string;
}

const SecondLineResultForm: FC<Props> = ({
  readonly,
  parent,
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

  const [assessment] = useState<ObjectWithContributors | undefined>(parent);

  const typeSelector = (
    <div className={'pb-5'}>
      <TypeSelector
        testId={'Type'}
        value={formResultType}
        readOnly={readonly}
        onChange={(val) => {
          setFormResultType(val);
        }}
        parent={parent}
      />
    </div>
  );

  const beforeFieldsSlot = <>{!hideTypeSelector && typeSelector}</>;

  return (
    <>
      {formResultType === Parent_Type_Enum.RiskAssessmentResult && (
        <ConnectedRiskSecondLineResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parent}
          navigateToResults={navigateToResults}
        />
      )}

      {formResultType === Parent_Type_Enum.DocumentAssessmentResult && (
        <ConnectedDocumentSecondLineResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parent}
          navigateToResults={navigateToResults}
        />
      )}

      {formResultType === Parent_Type_Enum.ObligationAssessmentResult && (
        <ConnectedObligationSecondLineResultForm
          readonly={readonly}
          isModalForm={true}
          parentId={assessment?.Id}
          assessedItem={assessedItem}
          onDismiss={onDismiss}
          id={id}
          beforeFieldsSlot={beforeFieldsSlot}
          showAssessmentSelector={!parent}
          navigateToResults={navigateToResults}
        />
      )}
    </>
  );
};

export default SecondLineResultForm;
