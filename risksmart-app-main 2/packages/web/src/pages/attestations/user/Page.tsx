import { useMutation } from '@apollo/client';
import { useGetUserIdParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Attestation_Record_Status_Enum,
  AttestationNotRequiredDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AttestationCards from 'src/components/attestations-cards';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useGetAttestationsRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';

import AttestationNotRequiredButton from './AttestationNotRequiredButton';
import { useGetCollectionCardProps } from './config';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const userId = useGetUserIdParam('userId');

  const { data, loading, refetch } = useGetAttestationsRegister({
    queryArgs: { userId },
  });
  const [mutate] = useMutation(AttestationNotRequiredDocument);

  const pendingAttestations: { id: string; name: string }[] = useMemo(() => {
    if (loading) {
      return [];
    }

    return (
      data?.attestation_record
        ?.filter(
          (ar) =>
            ar.AttestationStatus === Attestation_Record_Status_Enum.Pending &&
            ar.CycleId !== null
        )
        .map((ar) => ({
          id: ar.Id,
          name: ar.node.documentFile?.parent?.Title ?? 'Unknown Document',
        })) || []
    );
  }, [data, loading]);

  const title = st('register_title');

  const collectionProps = useGetCollectionCardProps(data?.attestation_record);

  const handleNotRequiredAttestations = async (
    attestationRecordIds: string[]
  ) => {
    if (attestationRecordIds.length === 0) {
      return;
    }

    await mutate({
      variables: {
        Ids: attestationRecordIds,
      },
    });

    await refetch();
  };

  return (
    <PageLayout
      title={title}
      helpTranslationKey={'policy.registerHelp'}
      counter={getCounter(collectionProps.totalItemsCount, loading)}
      actions={
        <>
          <ExportButton tableProps={collectionProps} />
          <Permission permission={'update:attestation_cycle'}>
            <AttestationNotRequiredButton
              attestations={pendingAttestations}
              loading={loading}
              onSave={handleNotRequiredAttestations}
              disabled={pendingAttestations.length === 0}
            />
          </Permission>
        </>
      }
    >
      <AttestationCards
        pagination={collectionProps.pagination}
        items={collectionProps.items}
        empty={collectionProps.empty}
        filter={collectionProps.filter}
        preferences={collectionProps.preferenceDetails.preferences}
        setPreferences={collectionProps.preferenceDetails.setPreferences}
        loading={loading}
      />
    </PageLayout>
  );
};

export default Page;
