import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetObligationByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';
import useControlsExportTable from 'src/pages/controls/update/useControlsExportTable';
import useIssuesExportTable from 'src/pages/issues/update/useIssuesExportTable';

import { getFriendlyId } from '@/utils/friendlyId';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable } from '@/utils/pdf/table';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import useAssessmentsExportTable from './useAssessmentsExportTable';
import useComplianceMonitoringAssessmentsExportTable from './useComplianceMonitoringAssessmentsExportTable';
import useImpactsExportTable from './useImpactsExportTable';
import useInternalAuditAssessmentsExportTable from './useInternalAuditAssessmentsExportTable';

const useExporter = (
  obligationId: string,
  includeInternalAudit: boolean,
  includeComplianceMonitoring: boolean
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'control',
    'action',
    'issue_assessment',
    'issue',
    'obligation',
    'obligation_impact',
    'assessment',
    'obligation_assessment_result',
    'compliance_monitoring_assessment',
    'internal_audit_report',
    'obligation_internal_audit_result',
    'obligation_second_line_result',
  ]);

  const { getLabel: getAdherenceLabel } = useRating('adherence');
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Obligation);

  const [createControlsTable, controlsLoading] = useControlsExportTable(
    obligationId,
    getStandardFieldLabel
  );
  const [createActionTable, actionsLoading] = useActionExportTable(
    obligationId,
    getStandardFieldLabel
  );
  const [createImpactsTable, impactsLoading] = useImpactsExportTable(
    obligationId,
    getStandardFieldLabel
  );
  const [createAssessmentsTable, assessmentsLoading] =
    useAssessmentsExportTable(obligationId, getStandardFieldLabel);
  const [createComplianceAssessmentsTable, complianceAssessmentsLoading] =
    useComplianceMonitoringAssessmentsExportTable(
      obligationId,
      getStandardFieldLabel
    );
  const [createInternalAuditsTable, internalAuditsLoading] =
    useInternalAuditAssessmentsExportTable(obligationId, getStandardFieldLabel);

  const [createIssueTable, issuesLoading] = useIssuesExportTable(
    obligationId,
    Parent_Type_Enum.Issue,
    getStandardFieldLabel
  );
  const { t: obligationFields } = useTranslation(['common'], {
    keyPrefix: 'obligations.fields',
  });

  const { t } = useTranslation(['common']);

  const types = obligationFields('types', { returnObjects: true });

  const [getObligation, getObligationResult] = useLazyQuery(
    GetObligationByIdDocument,
    {
      variables: {
        _eq: obligationId,
      },
    }
  );

  const loading =
    getObligationResult.loading ||
    customAttributesLoading ||
    actionsLoading ||
    controlsLoading ||
    issuesLoading ||
    impactsLoading ||
    assessmentsLoading ||
    complianceAssessmentsLoading ||
    internalAuditsLoading;
  const exportFunc = async () => {
    const { data: obligationData } = await getObligation();
    const createActionTablePromise = createActionTable();
    const createControlsTablePromise = createControlsTable();
    const createIssueTablePromise = createIssueTable();
    const createImpactsTablePromise = createImpactsTable();
    const createAssessmentsTablePromise = createAssessmentsTable();
    let complianceAssessmentsTable = createTable({ body: [[]] });
    if (includeComplianceMonitoring) {
      const createComplianceAssessmentsTablePromise =
        createComplianceAssessmentsTable();
      complianceAssessmentsTable =
        await createComplianceAssessmentsTablePromise;
    }

    let internalAuditsTable = createTable({ body: [[]] });
    if (includeInternalAudit) {
      const createInternalAuditsTablePromise = createInternalAuditsTable();
      internalAuditsTable = await createInternalAuditsTablePromise;
    }

    const obligation = obligationData?.obligation?.[0];
    const actionTable = await createActionTablePromise;
    const controlsTable = await createControlsTablePromise;
    const issueTable = await createIssueTablePromise;
    const impactTable = await createImpactsTablePromise;
    const assessmentsTable = await createAssessmentsTablePromise;

    if (!obligation) {
      return;
    }

    const title = `${obligation.Title} (${getFriendlyId(
      Parent_Type_Enum.Obligation,
      obligation.SequentialId
    )})`;

    const detailFields = [
      createField(
        getStandardFieldLabel('obligation', 'Title'),
        obligation.Title
      ),

      createField(
        getStandardFieldLabel('obligation', 'Type'),
        types[String(obligation.Type) as keyof typeof types]
      ),
      createField(
        getStandardFieldLabel('obligation', 'ParentId'),
        obligation.Parent?.Title ?? '-'
      ),
      createField(
        getStandardFieldLabel('obligation', 'Description'),
        obligation.Description
      ),
      createField(
        getStandardFieldLabel('obligation', 'Interpretation'),
        obligation.Interpretation
      ),
      createField(
        getStandardFieldLabel('obligation', 'Adherence'),
        getAdherenceLabel(obligation.Adherence)
      ),
      createField(
        getStandardFieldLabel('obligation', 'Owners'),
        getOwnerValue(obligation)
      ),
      createField(
        getStandardFieldLabel('obligation', 'Contributors'),
        getContributorValue(obligation)
      ),
      createField(
        getStandardFieldLabel('obligation', 'tags'),
        getTagsValue(obligation)
      ),
      createField(
        getStandardFieldLabel('obligation', 'departments'),
        getDepartmentsValue(obligation)
      ),
      ...(await getCustomAttribute(obligation)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(t('impacts.tab_title'), impactTable),
      optionalTableSection(t('controls.tab_title'), controlsTable),
      optionalTableSection(t('performance'), assessmentsTable),
      optionalTableSection(
        t('obligationsAssessments.complianceMonitoringRatingSubheading'),
        complianceAssessmentsTable
      ),
      optionalTableSection(
        t('obligationsAssessments.internalAuditRatingSubheading'),
        internalAuditsTable
      ),

      optionalTableSection(t('actions.tab_title'), actionTable),
      optionalTableSection(t('issues.tab_title'), issueTable),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
