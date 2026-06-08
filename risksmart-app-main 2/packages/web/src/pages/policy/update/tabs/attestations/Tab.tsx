import { useMutation, useQuery } from '@apollo/client';
import { Alert, Badge } from '@risk-smart/themed-cloudscape-components';
import {
  GetActiveAttestationCycleDocument,
  InsertAttestationConfigDocument,
  InsertAttestationCycleDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { ButtonVariant } from 'src/components/form/form/types';
import Loading from 'src/components/loading';
import { useGetAttestationConfig } from 'src/hooks/queries/attestations/useGetAttestationConfig';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { AttestationFormFields } from '../../forms/AttestationFormFields';
import type { AttestationFormFieldData } from '../../forms/attestationSchema';
import {
  AttestationFormSchema,
  defaultValues,
} from '../../forms/attestationSchema';
import AttestationCycleCardsContainer from './attestation-summary-cards/AttestationSummaryCardsContainer';
import type { ProposedCycle } from './attestation-summary-cards/ProposedAttestationCycleSummary';

type Props = {
  parentDocumentId: string;
};

const Tab: React.FC<Props> = (props: Props) => {
  const {
    hasPermission: canCreateDocument,
    loading: canCreateDocumentLoading,
  } = useHasPermissionQuery('insert:document');

  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  const { t } = useTranslation(['common']);

  const { data, loading } = useGetAttestationConfig({
    queryArgs: { parentDocumentId: props.parentDocumentId },
  });
  const [values, setValues] = useState<AttestationFormFieldData | undefined>(
    undefined
  );

  const [displayAttestationGroups, setDisplayAttestationGroups] =
    useState<boolean>(false);

  const { data: activeCycle } = useQuery(GetActiveAttestationCycleDocument, {
    variables: { parentDocumentId: props.parentDocumentId },
    fetchPolicy: 'no-cache',
  });

  const displayReAttestationRequiredControl = useMemo(() => {
    return (activeCycle?.attestation_cycle?.length ?? 0) > 0;
  }, [activeCycle]);

  const [proposal, setProposal] = useState<ProposedCycle | undefined>(
    undefined
  );

  const hasPublishedDocument = data?.document_file?.some(
    (doc) => doc.PublishedDate
  );

  const [createAttestationConfig] = useMutation(
    InsertAttestationConfigDocument
  );
  const [createAttestationCycle] = useMutation(InsertAttestationCycleDocument);

  useEffect(() => {
    const attestation = data?.attestation_config?.[0];

    if (attestation) {
      if (attestation.RequireGlobalAttestation) {
        setValues({
          requireReattestation: 'true',
          attestationTimeLimit: attestation?.AttestationTimeLimit || null,
          attestationPromptText: attestation?.PromptText || '',
          requireAttestationFromEveryone: 'true',
        });

        return;
      }

      setValues({
        requireReattestation: 'true',
        attestationTimeLimit: attestation?.AttestationTimeLimit || null,
        attestationPromptText: attestation?.PromptText || '',
        requireAttestationFromEveryone: 'false',
        attestationGroups:
          attestation?.groups?.map((group) => ({
            type: 'userGroup',
            value: group.GroupId,
          })) || [],
      });
    }
  }, [data]);

  const readOnly = !canCreateDocument || canCreateDocumentLoading || loading;

  const onSave = async (formData: AttestationFormFieldData) => {
    if (!hasPublishedDocument) {
      return;
    }

    const requireGlobalAttestation =
      formData.requireAttestationFromEveryone === 'true';

    if (useAttestationImprovements) {
      await createAttestationCycle({
        variables: {
          DocumentId: props.parentDocumentId,
          AllowCarryForward: formData.requireReattestation === 'false',
          attestationConfig: {
            ParentId: props.parentDocumentId,
            RequireGlobalAttestation: requireGlobalAttestation,
            AttestationTimeLimit: formData.attestationTimeLimit,
            AttestationPromptText: formData.attestationPromptText,
            AttestationGroupIds: requireGlobalAttestation
              ? []
              : formData.attestationGroups.map((group) => group.value),
          },
        },
      });
    } else {
      await createAttestationConfig({
        variables: {
          object: {
            ParentId: props.parentDocumentId,
            RequireGlobalAttestation: requireGlobalAttestation,
            AttestationTimeLimit: formData.attestationTimeLimit,
            AttestationPromptText: formData.attestationPromptText,
            AttestationGroupIds: requireGlobalAttestation
              ? []
              : formData.attestationGroups.map((group) => group.value),
          },
        },
      });
    }
    setValues(formData);
  };

  if (loading) {
    return <Loading />;
  }

  const totalUsers = proposal?.attestationRequiredCount ?? 0;

  return (
    <CustomisableForm
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      i18n={t('policy')}
      schema={AttestationFormSchema}
      defaultValues={defaultValues}
      formId={'attestation_cycle'}
      parentType={Parent_Type_Enum.AttestationCycle}
      onSave={onSave}
      values={values}
      secondaryActions={undefined}
      header={'Attestations'}
      aside={
        <>
          <AttestationCycleCardsContainer
            parentDocumentId={props.parentDocumentId}
            onProposalChange={setProposal}
            onDisplayAttestationGroupsChange={setDisplayAttestationGroups}
          />
        </>
      }
      submitActions={[
        {
          label: t('distribute'),
          action: onSave,
          variant: ButtonVariant.Primary,
          loading,
          disabled: !hasPublishedDocument,
        },
      ]}
    >
      {!hasPublishedDocument && (
        <Alert
          dismissible={false}
          type={'warning'}
          header={t('attestations.noPublishedDocumentWarningHeading')}
        >
          {t('attestations.noPublishedDocumentWarningMessage')}
        </Alert>
      )}
      <div className={'w-fit'}>
        <Badge color={totalUsers > 0 ? 'blue' : 'grey'}>
          {totalUsers > 0
            ? t('policy.users_affected', { count: totalUsers })
            : t('policy.no_users_affected')}
        </Badge>
      </div>
      <CustomisableFieldWrapper readOnly={readOnly}>
        <AttestationFormFields
          key={'attestationFormFields'}
          totalUsers={proposal?.attestationRequiredCount || 0}
          displayAttestationGroups={displayAttestationGroups}
          displayReAttestationRequiredControl={
            displayReAttestationRequiredControl
          }
        />
      </CustomisableFieldWrapper>
    </CustomisableForm>
  );
};

export default Tab;
