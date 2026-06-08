import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type {
  DepartmentPartsFragment,
  TagPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import type { LabelledIdArray } from 'src/rbac/types';

import { getFriendlyId } from '@/utils/friendlyId';

import type { AcceptanceFlatFields, AcceptanceTableFields } from './types';

const parentTitleFromLinkedParents = (
  data: AcceptanceFlatFields,
  { riskType }: { [key: string]: string }
) => {
  const titles = data.parents.map((parent) => {
    if (parent.risk) {
      return parent.risk?.Title ? `${parent.risk?.Title} (${riskType})` : '';
    }

    return null;
  });

  return titles.filter((t) => t).join(', ');
};

const parentTierFromLinkedParents = (
  data: AcceptanceFlatFields,
  tiers: { [key: string]: string }
) => {
  return data.parents
    .map((parent) => {
      if (parent.risk) {
        return parent.risk?.Tier
          ? tiers[String(parent.risk?.Tier) as keyof typeof tiers]
          : '';
      }

      return null;
    })
    .filter((t) => t)
    .join(', ');
};

const parentOwnersFromLinkedParents = (data: AcceptanceFlatFields) => {
  const owners: LabelledIdArray = [];
  data.parents.forEach((parent) => {
    if (parent.risk) {
      owners.push(...getAllOwnersCellValue(parent.risk));
    }
  });

  return owners;
};

const parentDepartmentsFromLinkedParents = (data: AcceptanceFlatFields) => {
  const departments: { [departmentTypeId: string]: DepartmentPartsFragment } =
    {};
  data.parents.forEach((parent) => {
    if (parent.risk) {
      for (const departmentType of parent.risk.departments) {
        if (!departments[departmentType.DepartmentTypeId]) {
          departments[departmentType.DepartmentTypeId] = departmentType;
        }
      }
    }
  });

  return Object.values(departments);
};

const parentTagsFromLinkedParents = (data: AcceptanceFlatFields) => {
  const tags: { [tagTypeId: string]: TagPartsFragment } = {};
  data.parents.forEach((parent) => {
    if (parent.risk) {
      for (const tagType of parent.risk.tags) {
        if (!tags[tagType.TagTypeId]) {
          tags[tagType.TagTypeId] = tagType;
        }
      }
    }
  });

  return Object.values(tags);
};

const parentContributorsFromLinkedParents = (data: AcceptanceFlatFields) => {
  const contributors: LabelledIdArray = [];
  data.parents.forEach((parent) => {
    if (parent.risk) {
      contributors.push(...getAllContributorsCellValue(parent.risk));
    }
  });

  return contributors;
};

export const useLabelledFields = (
  records: AcceptanceFlatFields[] | undefined
) => {
  const { getLabel } = useRating('acceptance_status');
  const { t } = useTranslation(['common']);
  const tiers = useMemo(() => t('tiers', { returnObjects: true }), [t]);

  return useMemo<AcceptanceTableFields[] | undefined>(() => {
    const typeLabels = { riskType: t('risk') };

    return records?.map((d) => {
      const status = d.changeRequests.some(
        (cr) => cr.ChangeRequestStatus === Approval_Status_Enum.Pending
      )
        ? 'pending_approval'
        : d.Status;

      return {
        ...d,
        Status: status,
        StatusLabelled: status ? getLabel(status) : '-',
        ParentTitle: parentTitleFromLinkedParents(d, typeLabels) ?? '-',
        Tier: parentTierFromLinkedParents(d, tiers) ?? '-',
        ModifiedByUserName: d.modifiedByUser?.FriendlyName ?? null,
        allOwners: parentOwnersFromLinkedParents(d),
        allContributors: parentContributorsFromLinkedParents(d),
        requestedBy:
          d.requestedByUser?.FriendlyName ??
          d.requestedByUserGroup?.Name ??
          null,
        approvedBy:
          d.approvedByUser?.FriendlyName ?? d.approvedByUserGroup?.Name ?? null,
        SequentialIdLabel: getFriendlyId(
          Parent_Type_Enum.Acceptance,
          d.SequentialId
        ),
        departments: parentDepartmentsFromLinkedParents(d),
        tags: parentTagsFromLinkedParents(d),
      };
    });
  }, [getLabel, records, tiers, t]);
};
