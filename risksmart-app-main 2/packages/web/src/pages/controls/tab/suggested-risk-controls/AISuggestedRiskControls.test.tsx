import {
  act,
  getByRole,
  getByText,
  queryByText,
  render,
} from '@testing-library/react';
import { AISuggestedRiskControls } from 'src/pages/controls/tab/suggested-risk-controls/AISuggestedRiskControls';
import type { AISuggestedRiskControlsResult } from 'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls';
import { vi } from 'vitest';

import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';

let workflowResult:
  | AIWorkflowJobResult<AISuggestedRiskControlsResult>
  | undefined = undefined;

const createFakeResponse =
  (): AIWorkflowJobResult<AISuggestedRiskControlsResult> => {
    return {
      jobId: '123',
      error: null,
      location: 'https://www.address.com',
      streamLocation: 'https://www.address.com/stream',
      runId: 'run123',
      result: {
        suggestedControls: [
          {
            controlId: '321',
            confidenceScore: 99,
            controlType: 'Directive',
            description: 'A control...',
            isLibraryMatch: false,
            title: 'A control',
            createdAtTimestamp: new Date().toISOString(),
            createdByUser: 'Test User',
          },
          {
            controlId: '322',
            confidenceScore: 95,
            controlType: 'Preventive',
            description: 'Another control...',
            isLibraryMatch: true,
            title: 'A seconds control',
            createdAtTimestamp: new Date().toISOString(),
            createdByUser: 'Test User',
          },
        ],
        metadata: {
          libraryMatching: {
            matchedCount: 1,
            totalCount: 2,
          },
        },
      },
    };
  };

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser', () => ({
  default: vi.fn(() => ({
    user: {
      userId: 'u123',
    },
  })),
}));

const onActionComplete = vi.fn();

vi.mock('@/components/side-panel/useSidePanelStore', () => ({
  useSidePanelStore: vi.fn(() => ({
    close: vi.fn(),
    onActionCompleted: onActionComplete,
  })),
}));

const mockedInsertControl = vi.fn();
const mockedLinkMutation = vi.fn(() =>
  Promise.resolve({
    errors: undefined,
  })
);

vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(() => [mockedLinkMutation]),
}));

vi.mock('@/hooks/mutations', () => ({
  useInsertControl: vi.fn(() => ({
    insertControl: mockedInsertControl,
    loading: false,
    error: null,
  })),
}));

const suggestControlsFunction = vi.fn();

vi.mock(
  'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls',
  vi.fn(() => ({
    useAISuggestControls: vi.fn(() => ({
      suggestControls: suggestControlsFunction,
    })),
  }))
);

/**
 * Prevents tests from failing where state is being updated from within a useEffect
 */
const emptyAct = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await act(async () => {});
};

describe('AISuggestedRiskControls', () => {
  beforeEach(() => {
    workflowResult = undefined;

    vi.resetAllMocks();
  });

  it('should show the loading screen when the job starts', async () => {
    let resolveInvoke!: (value: unknown) => void;
    const result = new Promise((resolve) => {
      resolveInvoke = resolve;
    });

    suggestControlsFunction.mockReturnValue(result);

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    const component = document.querySelector('div')!;

    expect(
      getByRole(component, 'button', { name: 'Close' })
    ).toBeInTheDocument();
    // Should be showing the initialising image
    expect(
      getByRole(component, 'img', { name: 'Loading' })
    ).toBeInTheDocument();

    await act(async () => resolveInvoke({}));
  });

  it('should show the results when the job has finished and there are results to show', async () => {
    workflowResult = createFakeResponse();

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));
    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const cards = component.querySelectorAll('li');

    // It should be showing the suggested controls
    expect(cards.length).toBe(2);

    const controlTitle = getByText(
      cards[0],
      workflowResult.result!.suggestedControls[0].description
    );

    expect(controlTitle).toBeInTheDocument();

    // AI disclaimer should be shown
    expect(
      getByText(
        component,
        'AI can make mistakes. Please review the suggested controls carefully before adding them.'
      )
    ).toBeInTheDocument();
  });

  it('should show the error when the promise rejects due to a timeout or error', async () => {
    suggestControlsFunction.mockReturnValue(
      Promise.reject('Something went wrong')
    );

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const somethingGoneWrongContent = getByText(
      component,
      'Please close the AI Suggestions and try again'
    );

    expect(somethingGoneWrongContent).toBeInTheDocument();
  });

  it('should show the all suggestions matched when the job has finished and there are results to show and they have all been matched', async () => {
    workflowResult = createFakeResponse();
    workflowResult.result!.suggestedControls!.length = 0;
    workflowResult.result!.metadata.libraryMatching.totalCount = 2;
    workflowResult.result!.metadata.libraryMatching.matchedCount = 2;

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const controlsMatchedMessage = getByText(
      component,
      'Your existing controls match all the controls I would suggest, therefore, no additional controls are recommended'
    );

    expect(controlsMatchedMessage).toBeInTheDocument();
  });

  it('should show the no suggestions message when the job has finished and there are no suggestions to show', async () => {
    workflowResult = createFakeResponse();
    workflowResult.result!.suggestedControls!.length = 0;
    workflowResult.result!.metadata.libraryMatching.matchedCount = 0;
    workflowResult.result!.metadata.libraryMatching.totalCount = 0;

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const noResultsContent = getByText(
      component,
      'Here are a few things you might want to update:'
    );

    const controlsMatchedMessage = queryByText(
      component,
      'Your existing controls match all the controls I would suggest, therefore, no additional controls are recommended'
    );

    expect(noResultsContent).toBeInTheDocument();
    expect(controlsMatchedMessage).toBeNull();
  });

  it('should prevent the user from clicking the add controls button when none have been selected', async () => {
    workflowResult = createFakeResponse();

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const addControlsButton = getByRole(component, 'button', {
      name: 'Add Controls',
    });

    expect(addControlsButton).toBeInTheDocument();
    expect(addControlsButton).toBeDisabled();
  });

  it.each([
    {
      description: 'the first',
      indexes: [0],
    },
    {
      description: 'the last',
      indexes: [1],
    },
    {
      description: 'all of the',
      indexes: [0, 1],
    },
  ])(
    'should enable the add controls button when $description suggested control has been selected',
    async ({ indexes }) => {
      workflowResult = createFakeResponse();

      suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

      render(
        <AISuggestedRiskControls
          riskId={'123'}
          onActionCompleted={onActionComplete}
        ></AISuggestedRiskControls>
      );

      await emptyAct();

      const component = document.querySelector('div')!;

      act(() => {
        const cards = component.querySelectorAll('li');

        for (const index of indexes) {
          cards[index].click();
        }
      });

      const addControlsButton = getByRole(component, 'button', {
        name: 'Add Controls',
      });

      expect(addControlsButton).toBeInTheDocument();
      expect(addControlsButton).toBeEnabled();
    }
  );

  it('should disable the add controls button when all of the selected controls are de-selected', async () => {
    workflowResult = createFakeResponse();

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    const addControlsButton = getByRole(component, 'button', {
      name: 'Add Controls',
    });

    act(() => {
      const cards = component.querySelectorAll('li');

      cards[0].click();
    });

    expect(addControlsButton).toBeEnabled();

    act(() => {
      const cards = component.querySelectorAll('li');

      cards[0].click();
    });

    expect(addControlsButton).toBeInTheDocument();
    expect(addControlsButton).toBeDisabled();
  });

  it('should add new controls that are selected', async () => {
    workflowResult = createFakeResponse();
    const newRisk = workflowResult.result!.suggestedControls[0];

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'r123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    act(() => {
      const cards = component.querySelectorAll('li');

      cards[0].click();
    });

    const addControlsButton = getByRole(component, 'button', {
      name: 'Add Controls',
    });

    expect(addControlsButton).toBeInTheDocument();
    expect(addControlsButton).toBeEnabled();

    await act(async () => {
      const addControlsButton = getByRole(component, 'button', {
        name: 'Add Controls',
      });

      addControlsButton.click();
    });

    expect(mockedInsertControl).toHaveBeenNthCalledWith(1, {
      Title: newRisk.title,
      Description: newRisk.description,
      Type: newRisk.controlType,
      ParentId: 'r123',
      DepartmentTypeIds: [],
      OwnerUserIds: ['u123'],
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

    await vi.waitFor(() => {
      expect(onActionComplete).toHaveBeenCalled();
    });
  });

  it('should link existing controls that are selected', async () => {
    workflowResult = createFakeResponse();
    workflowResult.result!.suggestedControls.push({
      isLibraryMatch: true,
      description: 'Linked description',
      createdByUser: 'User',
      createdAtTimestamp: new Date().toISOString(),
      controlId: 'l123',
      controlType: 'Preventive',
      title: 'Linked control',
      confidenceScore: 99,
    });

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    render(
      <AISuggestedRiskControls
        riskId={'r123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;

    act(() => {
      const cards = component.querySelectorAll('li');

      cards[2].click();
    });

    const addControlsButton = getByRole(component, 'button', {
      name: 'Add Controls',
    });

    expect(addControlsButton).toBeInTheDocument();
    expect(addControlsButton).toBeEnabled();

    await act(async () => {
      const addControlsButton = getByRole(component, 'button', {
        name: 'Add Controls',
      });

      addControlsButton.click();
    });

    expect(mockedLinkMutation).toHaveBeenNthCalledWith(1, {
      variables: { Source: 'r123', Targets: ['l123'] },
    });

    await vi.waitFor(() => {
      expect(onActionComplete).toHaveBeenCalled();
    });
  });

  it('should disable the controls whilst they are being added', async () => {
    workflowResult = createFakeResponse();

    suggestControlsFunction.mockReturnValue(Promise.resolve(workflowResult));

    // Need to prevent the add controls from completing so we can test it is
    // adding the desired class to the controls
    let resolveLink!: (val: { errors: undefined }) => void;
    mockedLinkMutation.mockReturnValue(
      new Promise<{ errors: undefined }>((resolve) => {
        resolveLink = resolve;
      })
    );

    render(
      <AISuggestedRiskControls
        riskId={'123'}
        onActionCompleted={onActionComplete}
      ></AISuggestedRiskControls>
    );

    await emptyAct();

    const component = document.querySelector('div')!;
    const cards = component.querySelectorAll('li');

    act(() => {
      cards[1].click();
    });

    const addControlsButton = getByRole(component, 'button', {
      name: 'Add Controls',
    });

    expect(addControlsButton).toBeInTheDocument();
    expect(addControlsButton).toBeEnabled();

    await act(async () => {
      getByRole(component, 'button', {
        name: 'Add Controls',
      }).click();
    });

    expect(cards[1].className.includes('cursor-not-allowed')).toBe(true);

    await act(async () => {
      resolveLink({ errors: undefined });
    });
  });
});
