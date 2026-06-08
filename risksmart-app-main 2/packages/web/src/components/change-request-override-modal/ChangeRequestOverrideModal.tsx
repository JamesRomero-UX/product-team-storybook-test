import { useMutation } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import Button from '@risksmart-app/components/src/button';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Modal from '@risksmart-app/components/src/modal';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  OverrideChangeRequestByIdDocument,
  UpdateApproverResponsesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/loading';
import { z } from 'zod';

import { CHANGE_REQUEST_OVERRIDE_ACTION } from '@/components/change-request-override-modal/changeRequestTypes';
import { evictField } from '@/utils/graphqlUtils';

import styles from '../change-request-levels/style.module.scss';
import { FormField } from '../form/form/FormField';

interface Props {
  changeRequestId: string;
  onDismiss: () => void;
  visible: boolean;
  mode: CHANGE_REQUEST_OVERRIDE_ACTION;
  activeLevel: string;
}

const ChangeRequestOverrideModal: FC<Props> = ({
  changeRequestId,
  onDismiss,
  visible,
  mode,
  activeLevel,
}) => {
  const { t } = useTranslation('common');
  const { t: ta } = useTranslation('common', { keyPrefix: 'approvals' });

  const [rationale, setRationale] = useState<string | undefined>();
  const [errors, setErrors] = useState<{ rationale: string | undefined }>({
    rationale,
  });
  const { user, isLoading } = useRisksmartUser();
  const { addNotification } = useNotifications();

  const [overrideChangeRequest, { loading: updatingOverride }] = useMutation(
    OverrideChangeRequestByIdDocument,
    {
      update: (cache) => {
        evictField(cache, 'change_request_by_pk');
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: error.message,
        });
      },
    }
  );

  const [updateResponse, { loading: updatingCR }] = useMutation(
    UpdateApproverResponsesDocument,
    {
      update: (cache) => {
        evictField(cache, 'change_request_by_pk');
      },
    }
  );

  const updating = updatingOverride || updatingCR;

  const schema = z.object({
    rationale: z
      .string({ required_error: 'You must provide a rationale' })
      .min(1, 'You must provide a rationale'),
    approved: z.boolean(),
  });

  const validate = () => {
    const result = schema.safeParse({ rationale, approved: true });

    if (
      !result.success &&
      !!result.error.issues.find((i) => i.path[0] === 'rationale')
    ) {
      setErrors({
        rationale: result.error.issues.find((i) => i.path[0] === 'rationale')
          ?.message,
      });

      return false;
    }

    setErrors({ rationale: undefined });

    return true;
  };

  const onSubmit = async (approved: boolean) => {
    if (validate()) {
      if (mode === CHANGE_REQUEST_OVERRIDE_ACTION.OVERRIDE) {
        await overrideChangeRequest({
          variables: {
            Id: changeRequestId,
            Rationale: rationale ?? '-',
            Approved: approved,
          },
        });
      } else {
        await updateResponse({
          variables: {
            input: {
              ChangeRequestId: changeRequestId,
              Response: approved,
              Comment: `Overridden by ${
                user?.claims_username ?? 'a risk manager'
              }. Rationale: ${rationale ?? 'n/a'}`,
              OverrideLevel: true,
              LevelId: activeLevel,
            },
          },
        });
        setRationale('');
      }

      onDismiss();
    }
  };
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={
        mode === CHANGE_REQUEST_OVERRIDE_ACTION.SKIP
          ? ta('overrideModalStepHeader')
          : ta('overrideModalOverallHeader')
      }
    >
      <div className={'flex flex-col gap-6'}>
        <Alert type={'warning'}>
          {mode === CHANGE_REQUEST_OVERRIDE_ACTION.SKIP
            ? ta('override_step_alert')
            : ta('override_change_request_modal_alert')}
        </Alert>
        <FormField label={'Rationale'} errorText={errors.rationale}>
          <Textarea
            name={'rationale'}
            value={rationale ?? ''}
            onChange={(e) => {
              setRationale(e.detail.value);
            }}
          />
        </FormField>
        <div className={'flex flex-row gap-3'}>
          <Button
            variant={'primary'}
            onClick={async () => await onSubmit(true)}
            disabled={updating}
          >
            {t('approve')}
          </Button>
          <Button
            onClick={async () => await onSubmit(false)}
            {...{ className: styles.dangerButton }}
            disabled={updating}
          >
            {t('reject')}
          </Button>
          <Button onClick={onDismiss} disabled={updating}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeRequestOverrideModal;
