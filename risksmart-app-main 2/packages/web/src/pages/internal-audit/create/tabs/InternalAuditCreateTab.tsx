import { useMutation } from '@apollo/client';
import { InsertInternalAuditDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';

import { evictField } from '@/utils/graphqlUtils';
import {
  internalAuditDetailsUrl,
  internalAuditRegisterUrl,
} from '@/utils/urls';

import InternalAuditForm from '../../forms/InternalAuditForm';
import type { InternalAuditFormDataFields } from '../../forms/internalAuditSchema';

const InternalAuditCreateTab: FC = () => {
  useI18NSummaryHelpContent('internalAudits.help');
  const navigate = useNavigate();

  const [mutate] = useMutation(InsertInternalAuditDocument, {
    update: (cache) => {
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'internal_audit_entity_aggregate');
      evictField(cache, 'business_area');
    },
  });

  const onSave = async (variables: InternalAuditFormDataFields) => {
    const { data } = await mutate({
      variables: {
        Input: {
          Title: variables.Title,
          Description: variables.Description ?? '',
          BusinessArea: variables.BusinessArea,
          CustomAttributeData: variables.CustomAttributeData || undefined,
          ...ownerAndContributorIds(variables),
          DepartmentTypeIds:
            variables.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: variables.tags?.map((t) => t.TagTypeId) || [],
        },
      },
    });
    if (data?.insertInternalAudit?.Id) {
      navigate(internalAuditDetailsUrl(data?.insertInternalAudit?.Id));
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(internalAuditRegisterUrl());
    }
  };

  return (
    <>
      <InternalAuditForm onSave={onSave} onDismiss={onDismiss} />
    </>
  );
};

export default InternalAuditCreateTab;
