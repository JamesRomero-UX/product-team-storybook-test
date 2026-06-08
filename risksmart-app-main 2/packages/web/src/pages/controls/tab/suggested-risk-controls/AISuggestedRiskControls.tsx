import { useMutation } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { LinkItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Plus, ThumbsDown, ThumbsUp } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { AISuggestedControlCard } from 'src/pages/controls/tab/suggested-risk-controls/AISuggestedControlCard';
import type { AISuggestedRiskControlsResult } from 'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls';
import { useAISuggestControls } from 'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls';
import { evictField, toLocalDate } from 'src/utils';

import { AIFeedbackModal } from '@/components/ai-feedback/AIFeedbackModal';
import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';
import { AISidePanelHeader } from '@/components/side-panel/ai/AISidePanelHeader';
import { AISidePanelLoading } from '@/components/side-panel/ai/AISidePanelLoading';
import { SidePanelContainer } from '@/components/side-panel/SidePanelContainer';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';
import { useInsertControl } from '@/hooks/mutations';
import { handleError } from '@/utils/errorUtils';

interface AISuggestedRiskControlProps {
  riskId: string;
  // no-dd-sa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onActionCompleted?: () => any | Promise<any>;
}

const positiveFeedbackOptions = [
  'The results were accurate',
  'I liked how the options were displayed',
  'The categorization was great',
];

const negativeFeedbackOptions = [
  'The recommendations did not make sense',
  'The categorization was inaccurate',
  'The confidence levels were wrong',
  'It created duplicates of what I already have',
];

type jobStatus = 'idle' | 'running' | 'errored-or-timed-out' | 'completed';

export const AISuggestedRiskControls: FC<AISuggestedRiskControlProps> = ({
  riskId,
  onActionCompleted,
}) => {
  const [workflowResult, setWorkflowResult] =
    useState<AIWorkflowJobResult<AISuggestedRiskControlsResult> | null>(null);

  const [selectedIds, setSelectedIds] = useState<
    {
      controlId: string;
      isSelected: boolean;
    }[]
  >([]);
  const [addingControls, setAddingControls] = useState<boolean>(false);

  const { addNotification } = useNotifications();

  const { user } = useRisksmartUser();

  const { close: closeSidePanel } = useSidePanelStore();

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackIsPositive, setFeedbackIsPositive] = useState(false);

  useEffect(() => {
    if (workflowResult?.result?.suggestedControls) {
      const selectedIds = workflowResult.result.suggestedControls.map(
        (control) => ({
          controlId: control.controlId,
          isSelected: false,
        })
      );

      setSelectedIds(selectedIds);
    }
  }, [workflowResult]);

  const [suggestionsStatus, setSuggestionsStatus] = useState<jobStatus>('idle');

  const { suggestControls } = useAISuggestControls();

  useEffect(() => {
    const run = async () => {
      setWorkflowResult(null);
      setSuggestionsStatus('running');

      try {
        const r = await suggestControls(riskId);

        setWorkflowResult(r);

        setSuggestionsStatus('completed');
      } catch (e) {
        setSuggestionsStatus('errored-or-timed-out');

        handleError(e);
      }
    };

    run().catch(() => setSuggestionsStatus('errored-or-timed-out'));

    // Only depend on the riskId to prevent the effect from constantly reloading

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskId]);

  const [linkControlToRisk] = useMutation(LinkItemsDocument, {
    update: (cache) => {
      evictField(cache, 'linked_item');
      evictField(cache, 'control');
      evictField(cache, 'action');
      evictField(cache, 'issue');
      evictField(cache, 'appetite');
      evictField(cache, 'risk');
    },
  });

  const { insertControl } = useInsertControl();

  const giveFeedback = (isPositive: boolean): (() => void) => {
    return () => {
      setFeedbackIsPositive(isPositive);
      setFeedbackModalVisible(true);
    };
  };

  const linkSelectedControls = async (): Promise<void> => {
    const controlsToLink = workflowResult!.result!.suggestedControls.filter(
      (ctrl) => {
        const ids = new Set(
          selectedIds
            .filter((ctrl) => ctrl.isSelected)
            .map((ctrl) => ctrl.controlId)
        );

        return ids.has(ctrl.controlId!) && ctrl.isLibraryMatch;
      }
    );

    if (controlsToLink.length > 0) {
      const result = await linkControlToRisk({
        variables: {
          Source: riskId!,
          Targets: controlsToLink.map((item) => item.controlId!),
        },
      });

      if ((result.errors?.length ?? 0) > 0) {
        throw new Error(
          'Encountered an error whilst linking the suggested controls'
        );
      }
    }
  };

  const addNewControls = async (): Promise<void> => {
    const controlsToAdd = workflowResult!.result!.suggestedControls.filter(
      (ctrl) => {
        const ids = new Set(
          selectedIds
            .filter((ctrl) => ctrl.isSelected)
            .map((ctrl) => ctrl.controlId)
        );

        return ids.has(ctrl.controlId!) && !ctrl.isLibraryMatch;
      }
    );

    let failedToAdd = false;

    for (const controlToAdd of controlsToAdd) {
      try {
        await insertControl({
          Title: controlToAdd.title,
          Description: controlToAdd.description,
          Type: controlToAdd.controlType,
          ParentId: riskId!,
          DepartmentTypeIds: [],
          OwnerUserIds: [user!.userId],
          OwnerGroupIds: [],
          ContributorGroupIds: [],
          ContributorUserIds: [],
          TagTypeIds: [],
          CustomAttributeData: undefined,
          schedule: {
            Frequency: undefined,
            ManualDueDate: undefined,
            StartDate: undefined,
            TimeToCompleteUnit: undefined,
            TimeToCompleteValue: undefined,
          },
        });
      } catch (e) {
        handleError(e);

        failedToAdd = true;
      }
    }

    if (failedToAdd) {
      throw new Error(
        'Encountered at least one failure when trying to add a suggested control'
      );
    }
  };

  const validateRiskIdAndUser = (): void => {
    if (!riskId) {
      throw new Error(
        'Attempting to add/link controls from the AI suggestions, but the parent RiskId has not been set'
      );
    }

    if (!user) {
      throw new Error(
        'Attempting to add/link controls from the AI suggestions, but there is no user set'
      );
    }
  };

  const addControls = async (): Promise<void> => {
    setAddingControls(true);

    const checkSettledPromises = (
      results: PromiseSettledResult<void>[]
    ): void => {
      let errorMessage = '';

      for (const result of results) {
        if (result.status === 'rejected') {
          handleError(result.reason);
          errorMessage += `${result.reason}. `;
        }
      }

      if (errorMessage) {
        throw new Error(errorMessage);
      }
    };

    const addAndLinkControls = async (): Promise<void> => {
      try {
        validateRiskIdAndUser();

        const result = await Promise.allSettled([
          addNewControls(),
          linkSelectedControls(),
        ]);

        checkSettledPromises(result);

        if (onActionCompleted) {
          await onActionCompleted();
        }
      } finally {
        closeSidePanel();

        setAddingControls(false);
      }
    };

    const promise = addAndLinkControls();

    addNotification({
      type: 'promise',
      promise,
      successMessage: 'Successfully added/linked controls',
      errorMessage: 'Encountered an error whilst adding/linking the controls',
    });

    await promise;
  };

  const selectionChanged = (id: string, selected: boolean): void => {
    const allOtherControls = [
      ...selectedIds.filter((ctrl) => ctrl.controlId !== id),
    ];

    const control = {
      controlId: id,
      isSelected: selected,
    };

    allOtherControls.push(control);

    setSelectedIds(allOtherControls);
  };

  const haveAllControlsMatched = (): boolean | undefined => {
    if (!workflowResult?.result) {
      return undefined;
    }

    return (
      workflowResult.result.metadata.libraryMatching.totalCount > 0 &&
      workflowResult.result.metadata.libraryMatching.matchedCount ===
        workflowResult.result.metadata.libraryMatching.totalCount
    );
  };

  const showResults =
    suggestionsStatus === 'completed' &&
    !!workflowResult?.result &&
    workflowResult?.result?.metadata.libraryMatching.totalCount > 0 &&
    !haveAllControlsMatched();

  const showAllSuggestionsMatched =
    suggestionsStatus === 'completed' && !!haveAllControlsMatched();

  const showNoSuggestions =
    suggestionsStatus === 'completed' &&
    (!workflowResult?.result ||
      workflowResult?.result?.metadata.libraryMatching.totalCount === 0);

  return (
    <>
      {feedbackModalVisible && (
        <AIFeedbackModal
          onDismiss={() => {
            setFeedbackModalVisible(false);
          }}
          positiveFeedbackOptions={positiveFeedbackOptions}
          negativeFeedbackOptions={negativeFeedbackOptions}
          isPositiveFeedback={feedbackIsPositive}
          runId={workflowResult?.runId ?? ''}
          workflowName={'Suggested controls'}
        ></AIFeedbackModal>
      )}
      <SidePanelContainer
        header={<AISidePanelHeader></AISidePanelHeader>}
        content={
          <div className={'overflow-y-scroll no-scrollbar'}>
            {suggestionsStatus === 'running' && (
              <AISidePanelLoading></AISidePanelLoading>
            )}
            {showResults && (
              <div className={'px-4 py-2 m-5'}>
                <h3 className={'ms-0 mt-0 mb-8'}>{'Suggested Controls'}</h3>
                <p>
                  {'Based on your current risk profile, I recommend implementing the following ' +
                    'controls to strengthen your risk management framework:'}
                </p>
                <ul className={'list-none p-0 mt-9'}>
                  {workflowResult?.result?.suggestedControls.map((control) => {
                    return (
                      <AISuggestedControlCard
                        key={control.controlId!}
                        id={control.controlId!}
                        title={control.title}
                        description={control.description}
                        date={toLocalDate(control.createdAtTimestamp)}
                        createdBy={control.createdByUser}
                        onCheckedChanged={selectionChanged}
                        confidenceScore={control.confidenceScore}
                        controlType={control.controlType}
                        isExisting={control.isLibraryMatch}
                        disabled={addingControls}
                      ></AISuggestedControlCard>
                    );
                  })}
                </ul>
                <div
                  className={
                    'flex flex-row justify-end mb-3 gap-1 items-center'
                  }
                >
                  <span className={'text-grey600'}>
                    {'Rate this response:'}
                  </span>
                  <button
                    onClick={giveFeedback(true)}
                    className={
                      'flex flex-row items-center text-sm rounded-lg border-none drop-shadow-md cursor-pointer py-2 px-3 bg-transparent text-grey600'
                    }
                    title={'Give positive feedback'}
                    aria-label={'Give positive feedback'}
                  >
                    <ThumbsUp width={'20px'} />
                  </button>
                  <button
                    onClick={giveFeedback(false)}
                    className={
                      'flex flex-row items-center text-sm rounded-lg border-none drop-shadow-md cursor-pointer py-2 px-3 bg-transparent text-grey600'
                    }
                    title={'Give negative feedback'}
                    aria-label={'Give negative feedback'}
                  >
                    <ThumbsDown width={'20px'} />
                  </button>
                </div>
                <p className={'text-grey500 text-sm italic'}>
                  {
                    'AI can make mistakes. Please review the suggested controls carefully before adding them.'
                  }
                </p>
                <button
                  className={
                    'flex flex-row items-center w-full justify-center text-sm rounded-lg border-none bg-magenta text-white py-3 drop-shadow-lg disabled:cursor-not-allowed disabled:bg-grey300 cursor-pointer'
                  }
                  onClick={addControls}
                  disabled={
                    !selectedIds.some((ctrl) => ctrl.isSelected) ||
                    addingControls
                  }
                >
                  <Plus width={'20px'} className={'mr-3'} /> {'Add Controls'}
                </button>
              </div>
            )}
            {showAllSuggestionsMatched && (
              <div className={'px-4 py-2 m-5'}>
                <h3 className={'ms-0 mt-0 mb-8'}>
                  {"Hello! I'm your assistant."}
                </h3>
                <p>
                  {
                    'Your existing controls match all the controls I would suggest, therefore, no additional controls are recommended'
                  }
                </p>
              </div>
            )}
            {showNoSuggestions && (
              <div className={'px-4 py-2 m-5'}>
                <h3 className={'ms-0 mt-0 mb-8'}>
                  {"Hello! I'm your assistant."}
                </h3>
                <p>
                  {
                    'I have not been able to create any control suggestions for you. This could be because your risk details and/or description do not contain enough information for me to generate controls for this risk. Please provide additional details.'
                  }
                </p>
                <p>
                  <strong>
                    {'Here are a few things you might want to update:'}
                  </strong>
                </p>
                <ul className={'p-2'}>
                  <li>{'Risk title'}</li>
                  <li>{'Risk description'}</li>
                </ul>
              </div>
            )}
            {suggestionsStatus === 'errored-or-timed-out' && (
              <div className={'px-4 py-2 m-5'}>
                <h3 className={'ms-0 mt-0 mb-8'}>
                  {"Hello! I'm your assistant."}
                </h3>
                <p>
                  {
                    'Unfortunately, something has gone wrong whilst trying to produce some suggested controls.'
                  }
                </p>
                <p>{'Please close the AI Suggestions and try again'}</p>
              </div>
            )}
          </div>
        }
      ></SidePanelContainer>
    </>
  );
};
