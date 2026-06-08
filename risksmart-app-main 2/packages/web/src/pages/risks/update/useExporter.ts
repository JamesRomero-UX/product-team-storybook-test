import { useLazyQuery } from '@apollo/client';
import {
  GetRiskByIdDocument,
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';
import useControlsExportTable from 'src/pages/controls/update/useControlsExportTable';
import useIndicatorExportTable from 'src/pages/indicators/update/useIndicatorExportTable';

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

import useAcceptancesExportTable from './useAcceptancesExportTable';
import useAppetitesExportTable from './useAppetitesExportTable';
import useExportAssessmentDetails from './useExportAssessmentDetails';
import useExportComplianceMonitoringDetails from './useExportComplianceMonitoringDetails';
import useExportInternalAuditDetails from './useExportInternalAuditDetails';

const useExporter = (
  riskId: string,
  includeInternalAudit: boolean,
  includeComplianceMonitoring: boolean
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'risk',
    'control',
    'appetite',
    'acceptance',
    'action',
    'indicator',
    'controlled_risk_assessment_result',
    'uncontrolled_risk_assessment_result',
    'compliance_monitoring_assessment',
    'assessment',
    'internal_audit_report',
  ]);

  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Risk);
  const [createIndicatorTable, indicatorsLoading] = useIndicatorExportTable(
    riskId,
    getStandardFieldLabel
  );
  const [createControlsTable, controlsLoading] = useControlsExportTable(
    riskId,
    getStandardFieldLabel
  );
  const [createActionTable, actionsLoading] = useActionExportTable(
    riskId,
    getStandardFieldLabel
  );
  const [createAppetitesTable, appetitesLoading] = useAppetitesExportTable(
    riskId,
    getStandardFieldLabel
  );
  const [createAcceptancesTable, acceptancesLoading] =
    useAcceptancesExportTable(riskId, getStandardFieldLabel);
  const [createControlledAssessmentDetails, controlledAssessmentLoading] =
    useExportAssessmentDetails(
      riskId,
      Risk_Assessment_Result_Control_Type_Enum.Controlled,
      getStandardFieldLabel
    );
  const [createUncontrolledAssessmentDetails, uncontrolledAssessmentLoading] =
    useExportAssessmentDetails(
      riskId,
      Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
      getStandardFieldLabel
    );
  const [createComplianceMonitoringTable, complianceMonitoringLoading] =
    useExportComplianceMonitoringDetails(riskId, getStandardFieldLabel);
  const [createInternalAuditTable, internalAuditLoading] =
    useExportInternalAuditDetails(riskId, getStandardFieldLabel);

  const { t } = useTranslation(['common']);

  const tiers = t('tiers', { returnObjects: true });
  const treatments = t('treatments', { returnObjects: true });
  const statuses = t('statuses', { returnObjects: true });
  const [getRisk, getRiskResult] = useLazyQuery(GetRiskByIdDocument, {
    variables: {
      _eq: riskId,
    },
  });

  const loading =
    getRiskResult.loading ||
    indicatorsLoading ||
    customAttributesLoading ||
    actionsLoading ||
    controlledAssessmentLoading ||
    uncontrolledAssessmentLoading ||
    controlsLoading ||
    appetitesLoading ||
    acceptancesLoading ||
    complianceMonitoringLoading ||
    internalAuditLoading;
  const exportFunc = async () => {
    const { data: riskData } = await getRisk();
    const createIndicatorTablePromise = createIndicatorTable();
    const createActionTablePromise = createActionTable();
    const createControlsTablePromise = createControlsTable();
    const createAppetitesTablePromise = createAppetitesTable();
    const createAcceptancesTablePromise = createAcceptancesTable();
    const createControlledAssessmentDetailsPromise =
      createControlledAssessmentDetails();
    const createUncontrolledAssessmentDetailsPromise =
      createUncontrolledAssessmentDetails();
    const risk = riskData?.risk?.[0];
    const indicatorTable = await createIndicatorTablePromise;
    const actionTable = await createActionTablePromise;
    const controlledAssessmentDetails =
      await createControlledAssessmentDetailsPromise;
    const uncontrolledAssessmentDetails =
      await createUncontrolledAssessmentDetailsPromise;
    const controlsTable = await createControlsTablePromise;
    const appetitesTable = await createAppetitesTablePromise;
    const acceptancesTable = await createAcceptancesTablePromise;
    let complianceAssessmentsTable = createTable({ body: [[]] });
    if (includeComplianceMonitoring) {
      const createComplianceAssessmentsTablePromise =
        createComplianceMonitoringTable();
      complianceAssessmentsTable =
        await createComplianceAssessmentsTablePromise;
    }

    let internalAuditsTable = createTable({ body: [[]] });
    if (includeInternalAudit) {
      const createInternalAuditsTablePromise = createInternalAuditTable();
      internalAuditsTable = await createInternalAuditsTablePromise;
    }
    if (!risk) {
      return;
    }

    const title = `${risk.Title} (${getFriendlyId(
      Parent_Type_Enum.Risk,
      risk.SequentialId
    )})`;

    const detailFields = [
      createField(getStandardFieldLabel('risk', 'Title'), risk.Title),
      createField(
        getStandardFieldLabel('risk', 'Description'),
        risk.Description
      ),
      createField(
        getStandardFieldLabel('risk', 'Tier'),
        tiers[String(risk.Tier) as keyof typeof tiers]
      ),
      createField(
        getStandardFieldLabel('risk', 'ParentRiskId'),
        risk.parent?.Title ?? '-'
      ),
      createField(
        getStandardFieldLabel('risk', 'Treatment'),
        risk.Treatment ? treatments[risk.Treatment] : '-'
      ),
      createField(
        getStandardFieldLabel('risk', 'Status'),
        risk.Status ? statuses[risk.Status] : '-'
      ),
      createField(getStandardFieldLabel('risk', 'Owners'), getOwnerValue(risk)),
      createField(
        getStandardFieldLabel('risk', 'Contributors'),
        getContributorValue(risk)
      ),
      createField(getStandardFieldLabel('risk', 'tags'), getTagsValue(risk)),
      createField(
        getStandardFieldLabel('risk', 'departments'),
        getDepartmentsValue(risk)
      ),
      ...(await getCustomAttribute(risk)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      createSubHeading(t('uncontrolledRiskAssessment.tab_title')),
      uncontrolledAssessmentDetails,
      optionalTableSection(t('controls.tab_title'), controlsTable),
      createSubHeading(t('controlledRiskAssessment.tab_title')),
      controlledAssessmentDetails,
      optionalTableSection(
        t('ratings.complianceRatingSubheading'),
        complianceAssessmentsTable
      ),
      optionalTableSection(
        t('ratings.internalAuditRatingSubheading'),
        internalAuditsTable
      ),
      optionalTableSection(t('appetites.tab_title'), appetitesTable),
      optionalTableSection(t('acceptances.tab_title'), acceptancesTable),
      optionalTableSection(t('actions.tab_title'), actionTable),
      optionalTableSection(t('indicators.tab_title'), indicatorTable),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
