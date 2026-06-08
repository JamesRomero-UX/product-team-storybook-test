import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import { notEmpty } from 'src/utilityTypes';

import { isActionStatusOverdue } from '@/components/action-status-badge/utils';
import useEntityInfo from '@/hooks/getEntityInfo';
import { getFriendlyId } from '@/utils/friendlyId';

import type { ActionFields, ActionTableFields } from './types';

export const useLabelledFields = (records: ActionFields[] | undefined) => {
  const status = useRating('action_status');
  const priority = useRating('priority');
  const getEntityInfo = useEntityInfo();

  return useMemo<ActionTableFields[]>(() => {
    return (
      records?.map((d) => {
        const parentId: null | string = null;
        const parentTitle = d.parents
          .map((p) => {
            if (!p?.parent?.ObjectType) {
              return;
            }
            const issueType = p.issue?.Type;
            const objectType =
              p.parent.ObjectType === Parent_Type_Enum.Issue && issueType
                ? issueType
                : p.parent.ObjectType;
            const entityInfo = getEntityInfo(objectType);

            return {
              label: `${
                objectType && p.parent.SequentialId
                  ? `${getFriendlyId(objectType, p.parent.SequentialId)}: `
                  : ''
              }${entityInfo.getTitle?.(p) ?? '-'} (${entityInfo.singular})`,
              url: entityInfo.url(p.parent.Id),
            };
          })
          .filter(notEmpty);

        const actionStatus =
          d.Status &&
          isActionStatusOverdue({
            item: {
              Status: d.Status,
              DateDue: d.DateDue,
            },
          })
            ? (status.getByValue('overdue')?.label ?? '')
            : status.getLabel(d.Status ?? null);

        return {
          ...d,
          StatusLabelled: actionStatus,
          PriorityLabelled:
            d.Priority !== undefined
              ? (priority.getLabel(d.Priority) ?? '-')
              : '-',
          ParentTitle: parentTitle,
          ParentId: parentId,
          ModifiedByUserName: d.modifiedByUser?.FriendlyName || '-',
          CreatedByUserName: d.createdByUser?.FriendlyName || '-',
          SequentialIdLabel: d.SequentialId
            ? getFriendlyId(Parent_Type_Enum.Action, d.SequentialId)
            : '',
          allOwners: getAllOwnersCellValue(d),
          allContributors: getAllContributorsCellValue(d),
          UpdateCount: d.actionUpdateSummary?.Count ?? 0,
          LatestUpdateCreatedAtTimestamp:
            d.actionUpdateSummary?.LatestCreatedAtTimestamp ?? null,
          LatestUpdateDescription:
            d.actionUpdateSummary?.LatestDescription ?? null,
          LatestUpdateTitle: d.actionUpdateSummary?.LatestTitle ?? null,
        };
      }) || []
    );
  }, [getEntityInfo, priority, records, status]);
};
