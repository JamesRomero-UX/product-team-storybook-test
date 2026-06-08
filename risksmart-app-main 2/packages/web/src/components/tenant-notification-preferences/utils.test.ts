import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { describe, expect, it } from 'vitest';

import type { WorkflowTemplate } from '@/components/notification-settings-modal/util';

import type { WorkflowPreferenceRow } from './types';
import {
  deriveCategorySummaries,
  gridStateToKnockPayload,
  knockPayloadToGridState,
} from './utils';

const mockWorkflows: WorkflowTemplate[] = [
  { key: 'action-insert', label: 'Action new', category: 'actions' },
  { key: 'action-update', label: 'Action updated', category: 'actions' },
  { key: 'control-insert', label: 'Control new', category: 'controls' },
];

describe('knockPayloadToGridState', () => {
  it('correctly maps channel booleans', () => {
    const payload = {
      channel_types: { email: true, in_app_feed: true, chat: true },
      workflows: {
        'action-insert': {
          enforced: false,
          channel_types: { email: true, in_app_feed: false, chat: true },
        },
        'action-update': {
          enforced: false,
          channel_types: { email: false, in_app_feed: true, chat: false },
        },
        'control-insert': {
          enforced: false,
          channel_types: { email: true, in_app_feed: true, chat: false },
        },
      },
      categories: {},
    };

    const rows = knockPayloadToGridState(payload, mockWorkflows);

    expect(rows).toHaveLength(3);

    const actionInsert = rows.find((r) => r.workflowKey === 'action-insert');
    expect(actionInsert).toBeDefined();
    expect(actionInsert!.channels.email).toBe(true);
    expect(actionInsert!.channels.in_app_feed).toBe(false);
    expect(actionInsert!.channels.chat).toBe(true);

    const actionUpdate = rows.find((r) => r.workflowKey === 'action-update');
    expect(actionUpdate!.channels.email).toBe(false);
    expect(actionUpdate!.channels.in_app_feed).toBe(true);
  });

  it('reads enforced boolean from tRPC output at workflow level', () => {
    const payload = {
      channel_types: { email: true, in_app_feed: true, chat: true },
      workflows: {
        'action-insert': {
          enforced: true,
          channel_types: { email: true, in_app_feed: true, chat: false },
        },
        'action-update': {
          enforced: false,
          channel_types: { email: false, in_app_feed: false, chat: false },
        },
        'control-insert': {
          enforced: false,
          channel_types: { email: true, in_app_feed: true, chat: true },
        },
      },
      categories: {},
    };

    const rows = knockPayloadToGridState(payload, mockWorkflows);

    const actionInsert = rows.find((r) => r.workflowKey === 'action-insert');
    expect(actionInsert!.enforced).toBe(true);

    const actionUpdate = rows.find((r) => r.workflowKey === 'action-update');
    expect(actionUpdate!.enforced).toBe(false);

    const controlInsert = rows.find((r) => r.workflowKey === 'control-insert');
    expect(controlInsert!.enforced).toBe(false);
  });

  it('handles empty/missing preferences gracefully', () => {
    const rows1 = knockPayloadToGridState(undefined, mockWorkflows);
    expect(rows1).toHaveLength(3);
    rows1.forEach((row) => {
      expect(row.enforced).toBe(false);
      for (const ch of ENABLED_CHANNELS) {
        expect(row.channels[ch]).toBe(false);
      }
    });

    const rows2 = knockPayloadToGridState(
      { channel_types: {}, workflows: {}, categories: {} },
      mockWorkflows
    );
    expect(rows2).toHaveLength(3);
    rows2.forEach((row) => {
      expect(row.enforced).toBe(false);
      for (const ch of ENABLED_CHANNELS) {
        expect(row.channels[ch]).toBe(false);
      }
    });
  });
});

describe('gridStateToKnockPayload', () => {
  it('produces correct tRPC-compatible format with enforced flags', () => {
    const rows: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: false },
      },
    ];

    const payload = gridStateToKnockPayload(rows);

    // Enforced workflow should have enforced: true
    expect(payload.workflows['action-insert'].enforced).toBe(true);
    expect(payload.workflows['action-insert'].channel_types.email).toBe(true);
    expect(payload.workflows['action-insert'].channel_types.chat).toBe(false);

    // Non-enforced workflow should have enforced: false
    expect(payload.workflows['action-update'].enforced).toBe(false);
    expect(payload.workflows['action-update'].channel_types.email).toBe(false);
  });

  it('computes category aggregates correctly', () => {
    const rows: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: false, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: false },
      },
      {
        workflowKey: 'control-insert',
        label: 'Control new',
        category: 'controls',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: true },
      },
    ];

    const payload = gridStateToKnockPayload(rows);

    // 'actions' category: email has at least one enabled -> true
    expect(payload.categories.actions.channel_types.email).toBe(true);
    // 'actions' category: in_app_feed has at least one enabled -> true
    expect(payload.categories.actions.channel_types.in_app_feed).toBe(true);
    // 'actions' category: chat has no enabled -> false
    expect(payload.categories.actions.channel_types.chat).toBe(false);
    // 'actions' category: ANY child enforced -> category enforced
    expect(payload.categories.actions.enforced).toBe(true);

    // 'controls' category: single child enforced -> enforced: true
    expect(payload.categories.controls.enforced).toBe(true);
    expect(payload.categories.controls.channel_types.email).toBe(true);
  });

  it('marks category not enforced only when NO children are enforced', () => {
    const rows: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: false, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: false },
      },
    ];

    const payload = gridStateToKnockPayload(rows);

    // No children enforced -> category not enforced
    expect(payload.categories.actions.enforced).toBe(false);
  });

  it('category enforced matches deriveCategorySummaries logic', () => {
    // All enforced: both functions agree
    const rowsAll: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: true,
        channels: { email: false, in_app_feed: true, chat: true },
      },
    ];

    const payloadAll = gridStateToKnockPayload(rowsAll);
    const summariesAll = deriveCategorySummaries(rowsAll);
    expect(payloadAll.categories.actions.enforced).toBe(true);
    expect(summariesAll[0].enforced).toBe(true);

    // Partial enforced: both functions agree (ANY = enforced)
    const rowsPartial: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: true },
      },
    ];

    const payloadPartial = gridStateToKnockPayload(rowsPartial);
    const summariesPartial = deriveCategorySummaries(rowsPartial);
    expect(payloadPartial.categories.actions.enforced).toBe(true);
    expect(summariesPartial[0].enforced).toBe(true);

    // None enforced: both functions agree
    const rowsNone: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: true, chat: false },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: true },
      },
    ];

    const payloadNone = gridStateToKnockPayload(rowsNone);
    const summariesNone = deriveCategorySummaries(rowsNone);
    expect(payloadNone.categories.actions.enforced).toBe(false);
    expect(summariesNone[0].enforced).toBe(false);
  });
});

describe('deriveCategorySummaries', () => {
  it('aggregates child workflow states', () => {
    const rows: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: false, chat: true },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: false, in_app_feed: true, chat: false },
      },
    ];

    const summaries = deriveCategorySummaries(rows);

    expect(summaries).toHaveLength(1);
    expect(summaries[0].category).toBe('actions');
    // email: at least one child enabled -> enabled
    expect(summaries[0].channels.email).toBe(true);
    // in_app_feed: at least one child enabled -> enabled
    expect(summaries[0].channels.in_app_feed).toBe(true);
    // chat: at least one child enabled -> enabled
    expect(summaries[0].channels.chat).toBe(true);
  });

  it('marks category enforced when ANY child is enforced', () => {
    const rowsPartial: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: true },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: true, chat: true },
      },
    ];

    const summariesPartial = deriveCategorySummaries(rowsPartial);
    // At least one child enforced -> category enforced
    expect(summariesPartial[0].enforced).toBe(true);

    const rowsAll: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: true },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: true,
        channels: { email: true, in_app_feed: true, chat: true },
      },
    ];

    const summariesAll = deriveCategorySummaries(rowsAll);
    // All children enforced -> category enforced
    expect(summariesAll[0].enforced).toBe(true);
  });

  it('marks category not enforced when no children are enforced', () => {
    const rows: WorkflowPreferenceRow[] = [
      {
        workflowKey: 'action-insert',
        label: 'Action new',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: true, chat: true },
      },
      {
        workflowKey: 'action-update',
        label: 'Action updated',
        category: 'actions',
        enforced: false,
        channels: { email: true, in_app_feed: true, chat: true },
      },
    ];

    const summaries = deriveCategorySummaries(rows);
    // No children enforced -> category not enforced
    expect(summaries[0].enforced).toBe(false);
  });
});
