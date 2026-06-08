import { useMutation } from '@apollo/client';
import {
  GetInternalAuditReportByIdDocument,
  InsertInternalAuditReportDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';

import { evictField } from '@/utils/graphqlUtils';
import { internalAuditReportDetailsUrl } from '@/utils/urls';

import InternalAuditReportForm from '../../forms/internal-audit-report-form';
import type { InternalAuditReportFormDataFields } from '../../forms/internal-audit-report-form/internalAuditReportSchema';

const InternalAuditReportCreateTab: FC = () => {
  const navigate = useNavigate();
  const [mutate] = useMutation(InsertInternalAuditReportDocument, {
    update: (cache) => {
      evictField(cache, 'internal_audit_report');
      evictField(cache, 'internal_audit_report_aggregate');
    },
    refetchQueries: [GetInternalAuditReportByIdDocument],
  });

  const onSave = async (variables: InternalAuditReportFormDataFields) => {
    const { data } = await mutate({
      variables: {
        object: {
          CustomAttributeData: variables.CustomAttributeData || undefined,
          ...ownerAndContributorIds(variables),
          TagTypeIds: variables.tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds:
            variables.departments?.map((d) => d.DepartmentTypeId) || [],
          CompletedByUser: variables.CompletedByUser?.value ?? null,
          Status: variables.Status,
          StartDate: variables.StartDate,
          Title: variables.Title,
          Summary: variables.Summary,
          ActualCompletionDate: variables.ActualCompletionDate,
          NextTestDate: variables.NextTestDate,
          TargetCompletionDate: variables.TargetCompletionDate,
          Outcome: variables.Outcome,
          OriginatingItemId: null,
        },
      },
    });
    const result = data?.insertInternalAuditReportApi;
    if (result?.Id) {
      navigate(internalAuditReportDetailsUrl(result.Id), { replace: true });
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <InternalAuditReportForm
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default InternalAuditReportCreateTab;
