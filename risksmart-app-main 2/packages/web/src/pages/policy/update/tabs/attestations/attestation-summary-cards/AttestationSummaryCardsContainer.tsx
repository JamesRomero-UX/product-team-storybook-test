import { useQuery } from '@apollo/client';
import { GetGlobalUsersAndGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import Loading from 'src/components/loading';
import { useGetAttestationCycles } from 'src/hooks/queries/attestations/useGetAttestationCycles';
import { useGetLatestPublicDocumentFileByDocumentId } from 'src/hooks/queries/document/useGetLatestPublicDocumentFileByDocumentId';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type { AttestationFormFieldData } from '../../../forms/attestationSchema';
import { calculateTotalUsers } from '../lib';
import { AttestationSummaryCards } from './AttestationSummaryCards';
import type { PreviousCycle } from './PreviousAttestationCycleSummary';
import type { ProposedCycle } from './ProposedAttestationCycleSummary';

type Props = {
  parentDocumentId: string;
  onProposalChange: (proposal: ProposedCycle) => void;
  onDisplayAttestationGroupsChange: (display: boolean) => void;
};

const Container: React.FC<Props> = ({
  parentDocumentId,
  onProposalChange,
  onDisplayAttestationGroupsChange,
}: Props) => {
  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  const { data: cycleData, loading: cycleLoading } = useGetAttestationCycles({
    queryArgs: { documentId: parentDocumentId },
  });

  const { data: documentVersionData, loading: documentVersionLoading } =
    useGetLatestPublicDocumentFileByDocumentId({
      queryArgs: { documentId: parentDocumentId },
    });

  const { data: globalUsersAndGroups } = useQuery(
    GetGlobalUsersAndGroupsDocument
  );

  const { watch } = useFormContext<AttestationFormFieldData>();

  const attestationForEveryone = watch('requireAttestationFromEveryone');
  const requireReattestation = watch('requireReattestation');
  const groups = watch('attestationGroups');

  useEffect(() => {
    onDisplayAttestationGroupsChange(attestationForEveryone === 'false');
  }, [attestationForEveryone, onDisplayAttestationGroupsChange]);

  const totalUsers = useMemo(() => {
    return calculateTotalUsers({
      query: globalUsersAndGroups,
      groups,
      attestationForEveryone: attestationForEveryone === 'true',
    });
  }, [globalUsersAndGroups, attestationForEveryone, groups]);

  const reissueAttestations = useMemo(() => {
    return requireReattestation === 'true';
  }, [requireReattestation]);

  // Calculate the proposal based on current state
  const currentProposal = useMemo<ProposedCycle | null>(() => {
    if (!useAttestationImprovements || cycleLoading || documentVersionLoading) {
      return null;
    }

    const activeCycle = cycleData?.attestation_cycle[0];
    const documentVersion = documentVersionData?.document_file[0];

    if (!documentVersion) {
      return null;
    }

    if (!activeCycle) {
      return {
        attestationRequiredCount: totalUsers.userIds.length,
        title: documentVersion.parent?.Title || '',
        version: documentVersion.Version,
      };
    }

    const attestedRecords = activeCycle.records?.filter(
      (r) => r.AttestationStatus === 'attested'
    );

    if (reissueAttestations) {
      return {
        reissueCycle: true,
        attestationRequiredCount: totalUsers.userIds.length,
        title: documentVersion.parent?.Title || '',
        version: documentVersion.Version,
      };
    }

    const getCarriedForwardCount = () => {
      if (totalUsers.userIds.length === 0 || reissueAttestations) {
        return 0;
      }

      const attestedRecordCount = attestedRecords?.filter((record) =>
        totalUsers.userIds.includes(record.UserId)
      ).length;

      return attestedRecordCount;
    };

    const getAttestationRequiredCount = () => {
      if (totalUsers.userIds.length === 0) {
        return 0;
      }

      if (reissueAttestations) {
        return totalUsers.userIds.length;
      }

      return totalUsers.userIds.length - getCarriedForwardCount();
    };

    return {
      title: documentVersion.parent?.Title || '',
      version: documentVersion.Version,
      reissueCycle: reissueAttestations,
      attestationRequiredCount: getAttestationRequiredCount(),
      carriedForwardCount: getCarriedForwardCount(),
    };
  }, [
    useAttestationImprovements,
    cycleLoading,
    documentVersionLoading,
    cycleData,
    documentVersionData,
    totalUsers,
    reissueAttestations,
  ]);

  // Notify parent of proposal changes
  useEffect(() => {
    if (currentProposal) {
      onProposalChange(currentProposal);
    }
  }, [currentProposal, onProposalChange]);

  if (!useAttestationImprovements) {
    return <></>;
  }

  if (cycleLoading || documentVersionLoading) {
    return <Loading />;
  }

  const activeCycle = cycleData?.attestation_cycle[0];
  const documentVersion = documentVersionData?.document_file[0];

  if (!documentVersion || !currentProposal) {
    return <></>;
  }

  if (!activeCycle) {
    return (
      <AttestationSummaryCards
        proposedCycle={{ ...currentProposal, reissueCycle: undefined }}
      />
    );
  }

  const previousCycle: PreviousCycle = {
    title: documentVersion.parent?.Title || '',
    version: activeCycle.parent?.Version,
    totalAttestedCount:
      activeCycle.records?.filter((r) => r.AttestationStatus === 'attested')
        .length || 0,
  };

  if (reissueAttestations) {
    return (
      <AttestationSummaryCards
        proposedCycle={currentProposal}
        previousCycle={previousCycle}
      />
    );
  }

  return (
    <AttestationSummaryCards
      proposedCycle={currentProposal}
      previousCycle={previousCycle}
    />
  );
};

export default Container;
