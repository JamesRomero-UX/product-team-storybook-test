import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import type {
  GetLinkedItemsQuery,
  OwnerGroupPartsFragment,
  OwnerPartsFragment,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Activity,
  AlertTriangle,
  Asterisk02,
  BezierCurve02,
  Certificate02,
  CheckCircleBroken,
  CheckVerified03,
  FileCheck01,
  Settings04,
  UsersPlus,
  Zap,
} from '@untitled-ui/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import Link from '@/components/link';
import useEntityInfo from '@/hooks/getEntityInfo';
import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';
import { useEntityPath } from '@/hooks/useEntityPath';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields } from '@/utils/table/types';
import {
  actionDetailsUrl,
  assessmentActivitiesDetailsUrl,
  causeDetailsUrl,
  complianceMonitoringAssessmentActivitiesDetailsUrl,
  consequenceDetailsUrl,
  controlDetailsUrl,
  impactDetailsUrl,
  internalAuditReportActivitiesDetailsUrl,
  obligationDetailsUrl,
} from '@/utils/urls';

import styles from './config.module.css';
import type { LinkedItemsTableFields } from './types';

const useGetProperties = () => {
  const { t } = useTranslation('taxonomy');
  const getEntityInfo = useEntityInfo();
  const { shouldShowEntityLabels } = useEntityLabelsFeature();
  const { getEntityPath } = useEntityPath();

  return (item: LinkedItemsTableFields) => {
    if (!item.target_node) {
      throw new Error('Missing target node');
    }

    if (item.target_risk) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      // Check if we should show entity labels and if entity data is available
      let typeLabel = i18n.format(entityInfo.singular, 'capitalize');
      if (
        shouldShowEntityLabels &&
        item.target_risk.enterpriseRiskInstance?.entity
      ) {
        const entityPath = getEntityPath(
          item.target_risk.enterpriseRiskInstance.entity.Id
        );
        if (entityPath) {
          typeLabel = `${typeLabel} • ${entityPath}`;
        }
      }

      return {
        typelabel: typeLabel,
        title: item.target_risk.Title,
        url,
        icon: <Zap />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_third_party) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_third_party.Title,
        url,
        icon: <UsersPlus />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_control) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_control.Title,
        url: controlDetailsUrl(
          item.target_control.Id,
          item.parentId,
          item.parentType
        ),
        icon: <Settings04 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_control_group) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(
          `${t('control_one')} ${t('control_group_one')}`,
          'capitalize'
        ),
        title: item.target_control_group.Title,
        url,
        icon: <Settings04 />,
      };
    }
    if (item.target_assessment) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_assessment.Title,
        url,
        icon: <Certificate02 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_internal_audit_report) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_internal_audit_report.Title,
        url,
        icon: <BezierCurve02 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }

    if (item.target_internal_audit_entity) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_internal_audit_entity.Title,
        url,
        icon: <BezierCurve02 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }

    if (item.target_assessment_activity) {
      let activityUrl;
      if (item.target_assessment_activity?.parentAssessment?.Id) {
        activityUrl = assessmentActivitiesDetailsUrl;
      }
      if (item.target_assessment_activity?.parentInternalAuditReport?.Id) {
        activityUrl = internalAuditReportActivitiesDetailsUrl;
      }
      if (
        item.target_assessment_activity?.parentComplianceMonitoringAssessment
          ?.Id
      ) {
        activityUrl = complianceMonitoringAssessmentActivitiesDetailsUrl;
      }

      return {
        typelabel: i18n.format(t('assessment_activity_one'), 'capitalize'),
        title: item.target_assessment_activity.Title,
        url: activityUrl
          ? `${activityUrl(
              item.target_assessment_activity.ParentId,
              item.target_assessment_activity.Id
            )}`
          : undefined,
        icon: <Settings04 />,
      };
    }
    if (item.target_impact) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_impact.Name,
        url,
        icon: <Asterisk02 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_impact_rating) {
      return {
        typelabel: i18n.format(t('impact_rating_one'), 'capitalize'),
        title: item.target_impact_rating.impact.Name,
        url: `${impactDetailsUrl(item.target_impact_rating.impact.Id)}/rating`,
        icon: <Asterisk02 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_obligation_impact) {
      return {
        typelabel: `${i18n.format(
          t('obligation_one'),
          'capitalize'
        )} ${i18n.format(t('impact_one'), '')}`,
        title: item.target_obligation_impact.Description,
        url: `${obligationDetailsUrl(
          item.target_obligation_impact.ParentObligationId
        )}/impact`,
        icon: <Asterisk02 />,
      };
    }
    if (item.target_action) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_action.Title,
        url,
        icon: <CheckCircleBroken />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_action_update) {
      return {
        typelabel: i18n.format(t('action_update_one'), 'capitalize'),
        title: item.target_action_update.Title,
        url: `${actionDetailsUrl(
          item.target_action_update.ParentActionId
        )}/updates`,
        icon: <CheckCircleBroken />,
      };
    }
    if (item.target_indicator) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_indicator.Title,
        url,
        icon: <Activity />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_acceptance) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_acceptance.Title,
        url,
        icon: <Zap />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_appetite) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        // @TODO: appetites don't have a title, work out how to display them (data set, lower / upper appetite etc, friendly ID etc)
        title: 'Appetite',
        url,
        icon: <Zap />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_issue) {
      const issueMapping =
        IssueTypeMapping[item.target_issue.Type as ParentIssueType];

      return {
        typelabel: i18n.format(t(issueMapping.entityLabel), 'capitalize'),
        title: item.target_issue.Title,
        url: issueMapping.detailsUrl(item.target_issue.Id),
        icon: <AlertTriangle />,
        sequentialId: getFriendlyId(
          issueMapping.type,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_issue_update) {
      return {
        typelabel: i18n.format(t('issue_update_one'), 'capitalize'),
        title: item.target_issue_update.Title,
        url: `${IssueTypeMapping[item.target_issue_update.issue!.Type as ParentIssueType].detailsUrl(item.target_issue_update.ParentIssueId)}/updates`,
        icon: <AlertTriangle />,
      };
    }
    if (item.target_document) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_document.Title,
        url,
        icon: <FileCheck01 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_obligation) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_obligation.Title,
        url,
        icon: <CheckVerified03 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_obligation_change) {
      const entityInfo = getEntityInfo(item.target_node?.ObjectType);
      const url = entityInfo.url(item.Target);

      return {
        typelabel: i18n.format(entityInfo.singular, 'capitalize'),
        title: item.target_obligation_change.obligation?.Title ?? '-',
        url,
        icon: <CheckVerified03 />,
        sequentialId: getFriendlyId(
          item.target_node.ObjectType,
          item.target_node.SequentialId
        ),
      };
    }
    if (item.target_consequence) {
      return {
        typelabel: i18n.format(t('consequence_one'), 'capitalize'),
        title: item.target_consequence.Title,
        url: consequenceDetailsUrl(
          item.target_consequence.ParentIssueId,
          item.target_consequence.Id
        ),
        icon: <AlertTriangle />,
      };
    }
    if (item.target_cause) {
      return {
        typelabel: i18n.format(t('cause_one'), 'capitalize'),
        title: item.target_cause.Title,
        url: causeDetailsUrl(
          item.target_cause.ParentIssueId,
          item.target_cause.Id
        ),
        icon: <AlertTriangle />,
      };
    }
    if (item.target_test_result) {
      return {
        typelabel: i18n.format(t('result_one'), 'capitalize'),
        title: item.target_test_result.Title,
        url: `${controlDetailsUrl(item.Source)}/performance`,
        icon: <Settings04 />,
      };
    }
  };
};

const getOwners = (item: LinkedItemsTableFields) => {
  for (const val of Object.values(item)) {
    if (
      // eslint-disable-next-line no-prototype-builtins
      val?.hasOwnProperty('owners') &&
      // eslint-disable-next-line no-prototype-builtins
      val?.hasOwnProperty('ownerGroups')
    ) {
      return getAllOwnersCellValue(
        val as {
          owners: OwnerPartsFragment[];
          ownerGroups: OwnerGroupPartsFragment[];
        }
      );
    }
  }

  return [];
};

const useGetLabelledFields = (
  data: GetLinkedItemsQuery | undefined,
  parentType: Parent_Type_Enum | undefined,
  parent: ObjectWithContributors
) => {
  const getProperties = useGetProperties();
  const hasAppetiteLinks = useIsFeatureFlagEnabled('appetite_links');
  const hasThirdParties = useIsModuleEnabled('third_party');

  return useMemo<LinkedItemsTableFields[]>(() => {
    return [
      ...(data?.linked_item ?? [])
        .filter(
          (li) =>
            li.target_acceptance ??
            li.target_action ??
            li.target_action_update ??
            (hasAppetiteLinks ? li.target_appetite : undefined) ??
            (hasThirdParties ? li.target_third_party : undefined) ??
            li.target_assessment ??
            li.target_internal_audit_report ??
            li.target_assessment_activity ??
            li.target_cause ??
            li.target_consequence ??
            li.target_control ??
            li.target_control_group ??
            li.target_document ??
            li.target_impact ??
            li.target_impact_rating ??
            li.target_indicator ??
            li.target_issue ??
            li.target_issue_update ??
            li.target_obligation ??
            li.target_obligation_impact ??
            li.target_obligation_change ??
            li.target_risk ??
            li.target_test_result
        )
        .map((li) => {
          const item = {
            ...li,
            SequentialId: '',
            parentId: parent.Id,
            allOwners: [],
            parentType,
            Name: '',
            Type: '',
            url: '',
            // As we're using a view, nullability on columns isn't correct, hence the "!"
            Id: li.Id!,
            Target: li.Target!,
            Source: li.Source!,
          };

          const allOwners = getOwners(item);
          const props = getProperties(item);

          return {
            ...item,
            SequentialId: props?.sequentialId ?? '-',
            Name: props?.title ?? '-',
            Type: props?.typelabel ?? '-',
            url: props?.url ?? '',
            allOwners,
          };
        }),
    ];
  }, [
    data?.linked_item,
    hasThirdParties,
    hasAppetiteLinks,
    parent.Id,
    parentType,
    getProperties,
  ]);
};

const useColumnDefinitions = () => {
  const getProperties = useGetProperties();
  const allOwners = useGetOwnersFieldConfig<LinkedItemsTableFields>();
  const columnDefinitions: TableFields<LinkedItemsTableFields> = {
    SequentialId: {
      id: 'id',
      header: 'ID',
      isRowHeader: true,
    },
    Name: {
      id: 'name',
      header: 'Name',
      cell: (item) => {
        return (
          <Link variant={'secondary'} href={item.url}>
            {item.Name}
          </Link>
        );
      },
      isRowHeader: true,
    },
    Type: {
      id: 'type',
      header: 'Type',
      cell: (item) => {
        const props = getProperties(item);

        return (
          <div className={styles.typeCell}>
            <div className={styles.typeIcon}>{props?.icon}</div>
            <div title={item.Type}>{item.Type}</div>
          </div>
        );
      },
      isRowHeader: true,
    },
    allOwners,
  };

  return columnDefinitions;
};

export const useGetLinkedItemsTableProps = (
  data: GetLinkedItemsQuery | undefined,
  parentType: Parent_Type_Enum | undefined,
  parent: ObjectWithContributors
) => {
  const { t } = useTranslation('common', { keyPrefix: 'linkedItems' });
  const labelledFields = useGetLabelledFields(data, parentType, parent);

  const columnDefinitions = useColumnDefinitions();

  return useGetTableProps({
    customAttributeFormIds: [],
    data: labelledFields,
    entityLabel: t('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'LinkedItemsTable-PreferencesV1',
    enableFiltering: true,
    initialColumns: ['SequentialId', 'Name', 'Type', 'allOwners'],
    fields: columnDefinitions,
  });
};
