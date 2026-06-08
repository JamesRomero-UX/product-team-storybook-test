import { useMutation } from '@apollo/client';
import { InsertDocumentDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { policyDetailsUrl } from '@/utils/urls';

import DocumentForm from '../../forms/DocumentForm';
import type { DocumentFormFieldData } from '../../forms/documentSchema';

const Tab: FC = () => {
  const {
    hasPermission: canCreateDocument,
    loading: canCreateDocumentLoading,
  } = useHasPermissionQuery('insert:document');
  const navigate = useNavigate();
  const [mutate] = useMutation(InsertDocumentDocument, {
    update: (cache) => {
      evictField(cache, 'document');
    },
  });

  const onSave = async ({
    ancestorContributors: _1,
    Contributors,
    Owners,
    linkedDocuments,
    attestationTimeLimit,
    attestationPromptText,
    attestationGroups,
    requireAttestationFromEveryone,
    departments,
    tags,
    ...data
  }: DocumentFormFieldData) => {
    const result = await mutate({
      variables: {
        object: {
          ...data,
          ...ownerAndContributorIds({ Contributors, Owners }),
          LinkedDocumentIds: linkedDocuments.map(
            (linkedDocument) => linkedDocument.value
          ),
          CustomAttributeData: data.CustomAttributeData || undefined,
          attestation: {
            RequireGlobalAttestation: requireAttestationFromEveryone === 'true',
            AttestationTimeLimit: attestationTimeLimit,
            AttestationPromptText: attestationPromptText,
            AttestationGroupIds: attestationGroups.map((group) => group.value),
          },
          TagTypeIds: tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds: departments?.map((d) => d.DepartmentTypeId) || [],
        },
      },
    });
    if (result.data?.insertChildDocument?.Id) {
      navigate(policyDetailsUrl(result.data?.insertChildDocument?.Id), {
        replace: true,
      });
    }
  };

  const onDismiss = (saved: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <DocumentForm
      onDismiss={onDismiss}
      onSave={onSave}
      readOnly={!canCreateDocument || canCreateDocumentLoading}
    />
  );
};

export default Tab;
