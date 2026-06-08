import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import type {
  AIAssistantFeedbackData,
  WorkflowFeedbackData,
} from '@/components/ai-feedback/useAIFeedbackService';
import { useAIFeedbackService } from '@/components/ai-feedback/useAIFeedbackService';

import styles from './style.module.scss';

type BaseProps = {
  isPositiveFeedback: boolean;
  positiveFeedbackOptions: string[];
  negativeFeedbackOptions: string[];
  runId: string;
  onDismiss: () => void | Promise<void>;
};

type WorkflowProps = {
  workflowName: string;
} & BaseProps;

type AIAssistantProps = {
  userQuery?: string;
  aiResponse?: string;
  sessionId: string;
  responseId: string;
} & BaseProps;

function isAIAssistantProps(props: BaseProps): props is AIAssistantProps {
  return (props as AIAssistantProps).sessionId !== undefined;
}

function isWorkflowProps(props: BaseProps): props is WorkflowProps {
  return (props as WorkflowProps).workflowName !== undefined;
}

export const AIFeedbackModal: FC<WorkflowProps | AIAssistantProps> = ({
  ...props
}) => {
  const { addNotification } = useNotifications();
  const { submitFeedback, error, loading } = useAIFeedbackService();

  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [primaryFeedback, setPrimaryFeedback] = useState<SelectProps.Option>({
    value: '',
    label: '',
  });

  const comment = useMemo(() => {
    if (primaryFeedback.value && additionalFeedback) {
      return `Primary feedback: ${primaryFeedback.value}. Additional feedback: ${additionalFeedback}`;
    } else if (primaryFeedback.value && !additionalFeedback) {
      return primaryFeedback.value;
    } else if (!primaryFeedback.value && additionalFeedback) {
      return additionalFeedback;
    }

    return undefined;
  }, [primaryFeedback, additionalFeedback]);

  const showNotification = useCallback(
    (isSuccess: boolean) => {
      if (isSuccess) {
        addNotification({
          type: 'success',
          content: 'Feedback submitted - thank you',
        });
      } else {
        addNotification({
          type: 'error',
          content: 'Failed to submit feedback',
        });
      }
    },
    [addNotification]
  );

  useEffect(() => {
    if (error) {
      showNotification(false);
      props.onDismiss();
    }
  }, [error, props, showNotification]);

  const feedbackOptions: string[] = useMemo(() => {
    return props.isPositiveFeedback
      ? props.positiveFeedbackOptions
      : props.negativeFeedbackOptions;
  }, [props]);

  async function save() {
    const baseData = {
      observabilityRunId: props.runId,
      isPositiveFeedback: props.isPositiveFeedback,
      comment,
    };

    let feedbackData: AIAssistantFeedbackData | WorkflowFeedbackData;

    if (isAIAssistantProps(props)) {
      const { userQuery, aiResponse, sessionId, responseId } = props;

      feedbackData = {
        ...baseData,
        userQuery,
        aiResponse,
        sessionId,
        responseId,
      };
    } else if (isWorkflowProps(props)) {
      const { workflowName } = props;

      feedbackData = { ...baseData, workflowName };
    } else {
      throw new Error('Props are not recognised');
    }

    await submitFeedback(feedbackData);

    showNotification(true);

    props.onDismiss();
  }

  const primaryFeedbackLabel = props.isPositiveFeedback
    ? 'What did you like about the response?'
    : 'What did you not like about the response?';

  return (
    <Modal
      visible={true}
      onDismiss={props.onDismiss}
      footer={
        <Box float={'left'}>
          <div className={styles.buttons}>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button
                variant={'primary'}
                onClick={save}
                loading={loading}
                loadingText={'Submitting feedback'}
                formAction={'none'}
                data-testid={'ok-button'}
              >
                {'Ok'}
              </Button>
              <Button
                variant={'normal'}
                onClick={props.onDismiss}
                formAction={'none'}
              >
                {'Cancel'}
              </Button>
            </SpaceBetween>
          </div>
        </Box>
      }
      header={'Feedback'}
    >
      <p className={'mb-8'}>
        {props.isPositiveFeedback &&
          'We are pleased to hear you liked the response. Please could you give a bit more information on what you liked about it?'}
        {!props.isPositiveFeedback &&
          'We are sorry to hear you did not like the response. Please could you tell us why you did not like it?'}
      </p>
      <FormField label={`(Optional): ${primaryFeedbackLabel}`}>
        <Select
          data-testid={'primary-feedback-options'}
          selectedOption={primaryFeedback}
          options={feedbackOptions.map((option) => ({
            label: option,
            value: option,
          }))}
          onChange={({ detail }) => setPrimaryFeedback(detail.selectedOption)}
        ></Select>
      </FormField>

      <div className={'mt-7'}>
        <FormField
          label={
            '(Optional): Any additional information you would like to provide?'
          }
        >
          <Textarea
            onChange={({ detail }) => setAdditionalFeedback(detail.value)}
            value={additionalFeedback}
          ></Textarea>
        </FormField>
      </div>

      <p className={'italic text-xs mt-6'}>
        {
          'Submitting this report will send additional information to RiskSmart for future improvements to our models.'
        }
      </p>
    </Modal>
  );
};
