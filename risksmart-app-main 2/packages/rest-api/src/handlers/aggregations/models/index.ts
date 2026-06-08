import { RiskScoringModelEnum } from 'generated/graphql';

import { modelConfig as controlEffectivenessAverages } from './controlEffectivenessAverages';
import { modelConfig as defaultScoring } from './defaultScoring';
import { modelConfig as numberOfControlsWithGaps } from './numberOfControlsWithGaps';
import { modelConfig as typedControlEffectivenessAverages } from './typedControlEffectivenessAverages';

export const models = {
  [RiskScoringModelEnum.ControlEffectivenessAverages]:
    controlEffectivenessAverages,
  [RiskScoringModelEnum.Default]: defaultScoring,
  [RiskScoringModelEnum.NumberOfControlsWithGaps]: numberOfControlsWithGaps,
  [RiskScoringModelEnum.TypedControlEffectivenessAverages]:
    typedControlEffectivenessAverages,
};
