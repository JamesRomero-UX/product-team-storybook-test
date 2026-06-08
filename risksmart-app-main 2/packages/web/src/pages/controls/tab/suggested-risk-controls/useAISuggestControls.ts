import type { ControlType } from '@risksmart-app/domain/src/types/consts';
import { v4 as uuidV4 } from 'uuid';

import { useAIWorkflowService } from '@/components/ai-workflows/useAIWorkflowService';
import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';

export interface AISuggestedRiskControl {
  controlId: string;
  title: string;
  description: string;
  controlType: ControlType;
  confidenceScore: number;
  isLibraryMatch: boolean;
  createdByUser: string;
  createdAtTimestamp: string;
}

export interface AISuggestedRiskControlsLibraryMatching {
  matchedCount: number;
  totalCount: number;
}

export interface AISuggestedRiskControlsMetadata {
  libraryMatching: AISuggestedRiskControlsLibraryMatching;
}

export interface AISuggestedRiskControlsResult {
  suggestedControls: AISuggestedRiskControl[];
  metadata: AISuggestedRiskControlsMetadata;
}

// This must match the options defined on the AI Workflow API
type SuggestionMode = 'clean-run' | 'complement-existing';

interface SuggestControlsBody {
  riskId: string;
  suggestionMode: SuggestionMode;
  // no-dd-sa
  matchAgainstControlLibrary: boolean;
  libraryMatchThreshold: number;
  additionalContext: string | null;
}

const settingsSessionStorageKey = 'AI-Suggest-Controls-Settings';

const applyDefaultsForMissingControlValues = (
  result: AIWorkflowJobResult<AISuggestedRiskControlsResult>
): AIWorkflowJobResult<AISuggestedRiskControlsResult> => {
  if (result.result) {
    return {
      ...result,
      result: {
        metadata: result.result.metadata,
        suggestedControls: result.result!.suggestedControls.map((ctrl) => {
          const { controlId, createdByUser, createdAtTimestamp, ...rest } =
            ctrl;

          return {
            ...rest,
            controlId: controlId ?? uuidV4(),
            createdByUser: createdByUser ?? 'AI',
            createdAtTimestamp: createdAtTimestamp ?? new Date().toISOString(),
          };
        }),
      },
    };
  }

  return result;
};

const buildSuggestControlsBody = (
  riskId: string
): (() => SuggestControlsBody) => {
  ////////
  // Temporary code to allow the product team to play around with the configuration
  // by adjusting values in session storage
  let settings = sessionStorage.getItem(settingsSessionStorageKey);

  if (!settings) {
    settings = JSON.stringify({
      suggestionMode: 'clean-run',
      matchAgainstControlLibrary: true,
      libraryMatchThreshold: 0.75,
      additionalContext: null,
    });

    sessionStorage.setItem(settingsSessionStorageKey, settings);
  }

  const controlSettings = JSON.parse(settings);
  ////////

  return () => ({
    riskId,
    ...controlSettings,
  });
};

export const useAISuggestControls = () => {
  const { runWorkflow } = useAIWorkflowService<AISuggestedRiskControlsResult>(
    'ai-engine/workflow-api/workflows/suggest-controls-by-risk-id'
  );

  const suggestControls = async (
    riskId: string
  ): Promise<AIWorkflowJobResult<AISuggestedRiskControlsResult>> => {
    return applyDefaultsForMissingControlValues(
      await runWorkflow(buildSuggestControlsBody(riskId))
    );
  };

  return {
    suggestControls,
  };
};
