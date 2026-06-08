import { getIssues as sharedDataset } from '@risksmart-app/shared/reporting/datasets/issues';

import { createDataset } from './types';

export const getIssues = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.issue',
    parentJoin: {
      pgTable: 'risksmart.issue_parent',
      idCol: 'IssueId',
      parentKeyCol: 'ParentId',
    },
    relations: {
      createdBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'CreatedByUser' }],
      },
      modifiedBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'ModifiedByUser' }],
      },
      issueAssessment: {
        pgTable: 'risksmart.issue_assessment',
        columnMapping: [{ pk: 'ParentIssueId', fk: 'Id' }],
      },
      issueStatus: {
        pgTable: 'risksmart.issue_status_view',
        columnMapping: [{ pk: 'Id', fk: 'Id' }],
      },
    },
    pk: 'Id',
    fields: {
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
      },
      detailsLink: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
      // Audit columns
      createdAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'CreatedAtTimestamp',
      },
      modifiedAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'ModifiedAtTimestamp',
      },
      createdById: {
        fieldType: 'column',
        pgColumn: 'CreatedByUser',
      },
      modifiedById: {
        fieldType: 'column',
        pgColumn: 'ModifiedByUser',
      },
      createdByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'createdBy',
        pgColumn: 'FriendlyName',
      },
      modifiedByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'modifiedBy',
        pgColumn: 'FriendlyName',
      },
      // End audit
      title: { fieldType: 'column', pgColumn: 'Title' },
      id: { fieldType: 'column', pgColumn: 'Id' },
      sequentialId: { fieldType: 'column', pgColumn: 'SequentialId' },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: {
        fieldType: 'inlineArrayJoin',
        type: 'departments',
      },
      impactsCustomer: {
        fieldType: 'column',
        pgColumn: 'ImpactsCustomer',
      },
      internalOrExternal: {
        fieldType: 'column',
        pgColumn: 'IsExternalIssue',
      },
      raised: { fieldType: 'column', pgColumn: 'RaisedAtTimestamp' },
      dateOccurred: {
        fieldType: 'column',
        pgColumn: 'DateOccurred',
      },
      dateIdentified: {
        fieldType: 'column',
        pgColumn: 'DateIdentified',
      },
      details: { fieldType: 'column', pgColumn: 'Details' },
      severity: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'Severity',
      },
      issueType: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'IssueType',
      },
      status: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueStatus',
        pgColumn: 'Status',
      },
      targetCloseDate: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'TargetCloseDate',
      },
      actualCloseDate: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'ActualCloseDate',
      },
      regulatoryBreach: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'RegulatoryBreach',
      },
      issueCausedByThirdParty: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'IssueCausedByThirdParty',
      },
      issueCausedBySystemIssue: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'IssueCausedBySystemIssue',
      },
      systemResponsible: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'SystemResponsible',
      },
      policyBreach: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'PolicyBreach',
      },
      policyOwnerCommentary: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'PolicyOwnerCommentary',
      },
      rationale: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'Rationale',
      },
      reportable: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'issueAssessment',
        pgColumn: 'Reportable',
      },
      type: { fieldType: 'column', pgColumn: 'Type' },
    },
  });
};
