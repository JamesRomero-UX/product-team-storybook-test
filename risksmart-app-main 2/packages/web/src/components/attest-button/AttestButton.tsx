import { useMutation } from '@apollo/client';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Button from '@risksmart-app/components/src/button';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Modal from '@risksmart-app/components/src/modal';
import {
  Attestation_Record_Status_Enum,
  AttestDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Check } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useGetAttestationStatus } from '@/hooks/queries';

import styles from './styles.module.scss';

const attestationStatusSchema = z.nativeEnum(Attestation_Record_Status_Enum);

type Props = {
  parentId: string;
};

export const AttestButton: FC<Props> = ({ parentId }) => {
  const { user, isLoading } = useRisksmartUser();
  const [modalVisible, setModalVisible] = useState(false);
  const { data, loading, refetch } = useGetAttestationStatus({
    queryArgs: { parentId, userId: user!.userId },
    shouldSkip: isLoading || !user,
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const [attest, { loading: mutating }] = useMutation(AttestDocument, {
    onCompleted: () => refetch(),
  });

  const attestationRecord = data?.attestation_record[0];

  const handleAttest = async () => {
    if (!attestationRecord) {
      return;
    }

    await attest({
      variables: { Id: attestationRecord.Id },
    });
    setModalVisible(false);
  };

  const statusString = attestationRecord?.attestationRecordStatus?.Status;
  const parsedStatus = statusString
    ? attestationStatusSchema.safeParse(statusString)
    : undefined;
  const status = parsedStatus?.success
    ? parsedStatus.data
    : attestationRecord?.AttestationStatus;

  const attested = status === Attestation_Record_Status_Enum.Attested;

  const notRequired =
    status === Attestation_Record_Status_Enum.NotRequired ||
    status === Attestation_Record_Status_Enum.Expired ||
    attestationRecord === undefined;

  return (
    <>
      <Button
        disabled={notRequired || attested}
        loading={loading || mutating}
        onClick={() => setModalVisible(true)}
        iconSvg={attested ? <Check viewBox={'0 0 24 24'} /> : null}
        {...{ className: attested ? styles.successButton : '' }}
      >
        {attested ? t('buttonText.attested') : t('buttonText.pending')}
      </Button>
      {modalVisible && (
        <Modal
          visible={true}
          header={<Header>{t('prompt.title')}</Header>}
          onDismiss={() => setModalVisible(false)}
        >
          <p className={'mt-0'}>
            {attestationRecord?.config?.PromptText ?? t('prompt.default')}
          </p>
          <div className={'flex flex-row gap-3'}>
            <Button
              loading={loading || mutating}
              variant={'primary'}
              onClick={handleAttest}
            >
              {t('prompt.confirm')}
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              {t('prompt.cancel')}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
