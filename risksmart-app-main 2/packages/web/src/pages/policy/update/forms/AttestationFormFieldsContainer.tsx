import { useQuery } from '@apollo/client';
import { GetGlobalUsersAndGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { calculateTotalUsers } from '../tabs/attestations/lib';
import { AttestationFormFields } from './AttestationFormFields';
import type { AttestationFormFieldData } from './attestationSchema';

export interface Props {
  onReattestationRequiredChange?: (required: boolean) => void;
  displayReAttestationRequiredControl: boolean;
}

export const Container: React.FC<Props> = ({
  onReattestationRequiredChange,
  displayReAttestationRequiredControl,
}: Props) => {
  const { watch } = useFormContext<AttestationFormFieldData>();

  const attestationForEveryone = watch('requireAttestationFromEveryone');
  const requireReattestation = watch('requireReattestation');

  const groups = watch('attestationGroups');

  const { data } = useQuery(GetGlobalUsersAndGroupsDocument);

  useEffect(
    () => onReattestationRequiredChange?.(requireReattestation === 'true'),
    [requireReattestation, onReattestationRequiredChange]
  );

  const totalUsers = useMemo(() => {
    return (
      calculateTotalUsers({
        query: data,
        groups,
        attestationForEveryone: attestationForEveryone === 'true',
      }).userIds.length ?? 0
    );
  }, [data, attestationForEveryone, groups]);

  return (
    <AttestationFormFields
      totalUsers={totalUsers}
      displayAttestationGroups={attestationForEveryone === 'false'}
      displayReAttestationRequiredControl={displayReAttestationRequiredControl}
    />
  );
};

export default Container;
