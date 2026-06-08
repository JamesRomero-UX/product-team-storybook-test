import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, vi } from 'vitest';

import { AIFeedbackModal } from './AIFeedbackModal';

const submitFeedback = vi.fn();
const addNotification = vi.fn();
const error = vi.fn<() => null | string>(() => null);

vi.mock('@/components/ai-feedback/useAIFeedbackService', () => ({
  useAIFeedbackService: vi.fn(() => ({
    submitFeedback,
    loading: false,
    error,
  })),
}));

vi.mock('@risksmart-app/components/src/notifications/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    addNotification: addNotification,
  })),
}));

const positiveFeedbackOptions = ['p1', 'p2'];
const negativeFeedbackOptions = ['n1', 'n2'];

let dismissed = false;

const onDismiss = () => {
  dismissed = true;
};

function createWorkflowFeedbackModal(isPositive: boolean) {
  return (
    <AIFeedbackModal
      isPositiveFeedback={isPositive}
      runId={'123'}
      positiveFeedbackOptions={positiveFeedbackOptions}
      negativeFeedbackOptions={negativeFeedbackOptions}
      workflowName={'test workflow'}
      onDismiss={onDismiss}
    ></AIFeedbackModal>
  );
}

//no-dd-sa
function createChatFeedbackModal(
  isPositive: boolean,
  userQuery: string = '',
  aiResponse: string = '',
  sessionId: string = '',
  responseId: string = ''
) {
  return (
    <AIFeedbackModal
      isPositiveFeedback={isPositive}
      runId={'123'}
      positiveFeedbackOptions={positiveFeedbackOptions}
      negativeFeedbackOptions={negativeFeedbackOptions}
      userQuery={userQuery}
      aiResponse={aiResponse}
      sessionId={sessionId}
      responseId={responseId}
      onDismiss={onDismiss}
    ></AIFeedbackModal>
  );
}

describe('AIFeedbackModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    dismissed = false;
    submitFeedback.mockReturnValue(true);
  });

  describe('when providing positive feedback', () => {
    it('should show the positive feedback message', () => {
      const screen = render(createWorkflowFeedbackModal(true));

      const message = screen.queryByText(
        'We are pleased to hear you liked the response. Please could you give a bit more information on what you liked about it?'
      );

      expect(message).toBeInTheDocument();
    });

    it('should show the positive label for the drop down list', () => {
      const screen = render(createWorkflowFeedbackModal(true));

      const label = screen.queryByText(
        '(Optional): What did you like about the response?'
      );

      expect(label).toBeInTheDocument();
    });

    it('should show the positive primary options', () => {
      const screen = render(createWorkflowFeedbackModal(true));

      const wrapper = createWrapper(screen.baseElement).findSelect()!;
      wrapper.openDropdown();

      const options = wrapper.findDropdown().findOptions();

      expect(options.length).toBe(2);
      expect(options[0].getElement().innerText).toBe('p1');
      expect(options[1].getElement().innerText).toBe('p2');
    });
  });

  describe('when providing negative feedback', () => {
    it('should show the negative feedback message', () => {
      const screen = render(createWorkflowFeedbackModal(false));

      const message = screen.queryByText(
        'We are sorry to hear you did not like the response. Please could you tell us why you did not like it?'
      );

      expect(message).toBeInTheDocument();
    });

    it('should show the negative label for the drop down list', () => {
      const screen = render(createWorkflowFeedbackModal(false));

      const label = screen.queryByText(
        '(Optional): What did you not like about the response?'
      );

      expect(label).toBeInTheDocument();
    });

    it('should show the negative primary options', () => {
      const screen = render(createWorkflowFeedbackModal(false));

      const wrapper = createWrapper(screen.baseElement).findSelect()!;
      wrapper.openDropdown();

      const options = wrapper.findDropdown().findOptions();

      expect(options.length).toBe(2);
      expect(options[0].getElement().innerText).toBe('n1');
      expect(options[1].getElement().innerText).toBe('n2');
    });
  });

  describe('when cancelling the modal', () => {
    describe.each([
      {
        desc: 'clicking the cancel button',
        // no-dd-sa
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector: (screen: any): HTMLElement => screen.getByText('Cancel'),
      },
      {
        desc: 'clicking the "X" in the top corner',
        selector: () =>
          document.querySelector('[class*="awsui_header_"] button'),
      },
      {
        desc: 'clicking outside the modal',
        // no-dd-sa
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector: (screen: any) => screen.getByRole('dialog'),
      },
    ])(`by $desc`, ({ selector }) => {
      it('should invoke the onDismiss callback', async () => {
        const screen = render(createWorkflowFeedbackModal(false));

        const closeButton = selector(screen) as HTMLElement;

        await user.click(closeButton);

        expect(dismissed).toBe(true);
      });
    });
  });

  // no-dd-sa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addPrimaryFeedback(screen: any, positive: boolean) {
    const optionToSelect = positive ? 'p1' : 'n1';

    const wrapper = createWrapper(screen.baseElement).findSelect()!;
    wrapper.openDropdown();

    wrapper.selectOptionByValue(optionToSelect);
  }

  // no-dd-sa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addAdditionalFeedback(screen: any) {
    const wrapper = createWrapper(screen.baseElement);
    const textArea = wrapper.findTextarea()!;

    textArea.setTextareaValue('Some feedback');
  }

  describe.each([
    {
      desc: 'positive',
      positive: true,
    },
    {
      desc: 'negative',
      positive: false,
    },
  ])('when submitting $desc feedback', ({ positive }) => {
    describe.each([
      {
        desc: 'workflow',
        modal: (positive: boolean) => createWorkflowFeedbackModal(positive),
        isWorkflow: true,
      },
      {
        desc: 'chat',
        modal: (positive: boolean) =>
          createChatFeedbackModal(
            positive,
            'query',
            'ai response',
            'session id',
            'response id'
          ),
        isWorkflow: false,
      },
    ])('for $desc', ({ modal, isWorkflow }) => {
      describe.each([
        {
          desc: 'no feedback',
          action: () => {
            /* empty */
          },
          expectedComment: undefined,
        },
        {
          desc: 'primary feedback only',
          // no-dd-sa
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          action: (screen: any) => addPrimaryFeedback(screen, positive),
          expectedComment: positive ? 'p1' : 'n1',
        },
        {
          desc: 'additional feedback only',
          // no-dd-sa
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          action: (screen: any) => addAdditionalFeedback(screen),
          expectedComment: 'Some feedback',
        },
        {
          desc: 'primary and additional feedback',
          // no-dd-sa
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          action: (screen: any) => {
            addPrimaryFeedback(screen, positive);
            addAdditionalFeedback(screen);
          },
          expectedComment: `Primary feedback: ${positive ? 'p1' : 'n1'}. Additional feedback: Some feedback`,
        },
      ])('whilst providing $desc', ({ action, expectedComment }) => {
        beforeEach(async () => {
          const screen = render(modal(positive));

          action(screen);

          const button = screen.baseElement.querySelector(
            'button[data-testid="ok-button"]'
          );

          await user.click(button!);
        });

        it.runIf(isWorkflow)(
          'should call the AI feedback service passing the workflow based information',
          async () => {
            expect(submitFeedback).toHaveBeenCalledWith({
              observabilityRunId: '123',
              isPositiveFeedback: positive,
              comment: expectedComment,
              workflowName: 'test workflow',
            });
          }
        );

        it.skipIf(isWorkflow)(
          'should call the AI feedback service passing the chat based information',
          async () => {
            expect(submitFeedback).toHaveBeenCalledWith({
              observabilityRunId: '123',
              isPositiveFeedback: positive,
              comment: expectedComment,
              userQuery: 'query',
              aiResponse: 'ai response',
              sessionId: 'session id',
              responseId: 'response id',
            });
          }
        );

        it('should display a notification indicating the feedback was successfully submitted', () => {
          expect(addNotification).toHaveBeenCalledWith({
            type: 'success',
            content: 'Feedback submitted - thank you',
          });
        });

        it('should call the onDismiss callback', () => {
          expect(dismissed).toBe(true);
        });
      });
    });
  });

  describe('when an error is encountered during the submission', () => {
    beforeEach(async () => {
      submitFeedback.mockReturnValue(false);

      const screen = render(createWorkflowFeedbackModal(false));

      const button = screen.baseElement.querySelector(
        'button[data-testid="ok-button"]'
      );

      await user.click(button!);

      error.mockReturnValue('Something has gone wrong');
    });

    it('should show an error notification', async () => {
      expect(addNotification).toHaveBeenNthCalledWith(1, {
        type: 'error',
        content: 'Failed to submit feedback',
      });
    });

    it('should call the onDismiss callback', () => {
      expect(dismissed).toBe(true);
    });
  });
});
