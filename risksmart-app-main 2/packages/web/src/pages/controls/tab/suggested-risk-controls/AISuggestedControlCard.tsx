import type { ControlType } from '@risksmart-app/domain/src/types/consts';
import { type FC } from 'react';
import { toLocalDate } from 'src/utils';

import { AISuggestionCard } from '@/components/side-panel/ai/assistance/AISuggestionCard';
import { AISuggestionCardTag } from '@/components/side-panel/ai/assistance/AISuggestionCardTag';

interface AISuggestedControlCardProps {
  id: string;
  confidenceScore: number;
  controlType: ControlType;
  isExisting: boolean;
  title: string;
  description: string;
  date?: string;
  createdBy: string;
  onCheckedChanged: (id: string, checked: boolean) => void;
  //no-dd-sa
  disabled: boolean;
}

export const AISuggestedControlCard: FC<AISuggestedControlCardProps> = ({
  id,
  confidenceScore,
  controlType,
  isExisting,
  title,
  description,
  date,
  createdBy,
  onCheckedChanged,
  disabled,
}) => {
  return (
    <AISuggestionCard
      title={title}
      description={description}
      tags={[
        <AISuggestionCardTag
          text={`Confidence level ${confidenceScore}%`}
          color={confidenceScore > 80 ? 'green' : 'orange'}
          key={'confidence-level'}
        ></AISuggestionCardTag>,
        <AISuggestionCardTag
          text={controlType}
          color={'grey'}
          key={'control-type'}
        ></AISuggestionCardTag>,
        isExisting && (
          <AISuggestionCardTag
            text={'Existing'}
            color={'teal'}
            key={'is-existing'}
          ></AISuggestionCardTag>
        ),
      ]}
      id={id}
      createdBy={createdBy}
      date={date ?? toLocalDate(new Date().toDateString())}
      onCheckedChanged={onCheckedChanged}
      checkedColour={isExisting ? 'teal' : 'magenta'}
      disabled={disabled}
    ></AISuggestionCard>
  );
};
