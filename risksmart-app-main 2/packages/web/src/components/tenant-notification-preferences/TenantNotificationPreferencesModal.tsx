import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  Spinner,
} from '@risksmart-app/atomic-ui';
import type { EnabledChannel } from '@risksmart-app/shared/knock/schemas';
import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useTRPC } from 'src/utils/trpc';

import { useWorkflows } from '@/components/notification-settings-modal/util';

import CategorySummaryRow from './CategorySummaryRow';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import type { WorkflowPreferenceRow } from './types';
import {
  deriveCategorySummaries,
  gridStateToKnockPayload,
  knockPayloadToGridState,
} from './utils';
import WorkflowRow from './WorkflowRow';

type Props = {
  onClose: () => void;
};

const TenantNotificationPreferencesModal = ({ onClose }: Props) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'notification_settings',
  });
  const { t: tc } = useTranslation(['common']);
  const trpc = useTRPC();
  const workflows = useWorkflows();

  // Defence-in-depth permission check inside the modal
  const { hasPermission: canSave } = useHasPermissionQuery('update:settings');

  const { data, isLoading, isError } = useQuery(
    trpc.frontend.notifications.preferences.get.queryOptions()
  );

  const mutation = useMutation(
    trpc.frontend.notifications.preferences.set.mutationOptions()
  );

  const [gridState, setGridState] = useState<WorkflowPreferenceRow[] | null>(
    null
  );
  // Start all categories expanded for this admin modal
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [showConfirm, setShowConfirm] = useState(false);

  // useEffect instead of useMemo because this is a side-effect (setGridState)
  useEffect(() => {
    if (data && !gridState) {
      setGridState(knockPayloadToGridState(data, workflows));
    }
  }, [data, workflows, gridState]);

  const rows = useMemo(() => gridState ?? [], [gridState]);

  const categorySummaries = useMemo(
    () => deriveCategorySummaries(rows),
    [rows]
  );

  const channelLabels = t('channel_types', {
    returnObjects: true,
  }) as Record<string, string>;
  const categoryLabels = t('categories', { returnObjects: true }) as Record<
    string,
    string
  >;

  const toggleChannel = useCallback(
    (workflowKey: string, channel: EnabledChannel) => {
      setGridState((prev) => {
        if (!prev) {
          return prev;
        }

        return prev.map((row) => {
          if (row.workflowKey !== workflowKey || row.enforced) {
            return row;
          }

          return {
            ...row,
            channels: {
              ...row.channels,
              [channel]: !row.channels[channel],
            },
          };
        });
      });
    },
    []
  );

  // Enforced is per-workflow, not per-cell
  const toggleEnforced = useCallback((workflowKey: string) => {
    setGridState((prev) => {
      if (!prev) {
        return prev;
      }

      return prev.map((row) => {
        if (row.workflowKey !== workflowKey) {
          return row;
        }

        return {
          ...row,
          enforced: !row.enforced,
        };
      });
    });
  }, []);

  const isCategoryExpanded = useCallback(
    (category: string) => expandedCategories[category] !== false,
    [expandedCategories]
  );

  const toggleCategoryExpansion = useCallback((category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: prev[category] === false,
    }));
  }, []);

  const handleSave = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!rows.length) {
      return;
    }

    const payload = gridStateToKnockPayload(rows);
    try {
      await mutation.mutateAsync({ preferences: payload });
      setShowConfirm(false);
      onClose();
    } catch {
      setShowConfirm(false);
    }
  }, [rows, mutation, onClose]);

  const handleCancelSave = useCallback(() => {
    setShowConfirm(false);
  }, []);

  // Group workflows by category for display
  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, WorkflowPreferenceRow[]> = {};
    for (const row of rows) {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(row);
    }

    return grouped;
  }, [rows]);

  const gridColumns = `1fr repeat(${ENABLED_CHANNELS.length}, 100px) 60px`;

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        size={'lg'}
      >
        <Dialog.Header title={t('tenant_modal_title')} />
        <Dialog.Body>
          {mutation.isError && (
            <Alert variant={'error'} className={'mb-4'}>
              <AlertTitle>{t('tenant_save_error')}</AlertTitle>
              <AlertDescription>
                {t('tenant_save_error_detail')}
              </AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div
              data-testid={'loading-spinner'}
              className={'grid place-items-center p-4'}
            >
              <Spinner />
            </div>
          ) : isError ? (
            <Alert variant={'error'}>
              <AlertTitle>{t('tenant_load_error')}</AlertTitle>
              <AlertDescription>
                {t('tenant_load_error_detail')}
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              {/* Column headers */}
              <div
                style={{ display: 'grid', gridTemplateColumns: gridColumns }}
                className={'items-center py-2 px-1 border-b'}
              >
                <div className={'font-bold'}>
                  {t('tenant_column_notification')}
                </div>
                {ENABLED_CHANNELS.map((channel) => (
                  <div key={channel} className={'font-bold text-center'}>
                    {channelLabels[channel] ?? channel}
                  </div>
                ))}
                <div className={'font-bold text-center'}>
                  {t('tenant_column_lock')}
                </div>
              </div>

              {/* Category sections */}
              {categorySummaries.map((summary) => (
                <div key={summary.category}>
                  <CategorySummaryRow
                    summary={summary}
                    gridColumns={gridColumns}
                    isExpanded={isCategoryExpanded(summary.category)}
                    categoryLabel={
                      categoryLabels[summary.category] ?? summary.category
                    }
                    onToggleExpand={() =>
                      toggleCategoryExpansion(summary.category)
                    }
                  />
                  {isCategoryExpanded(summary.category) &&
                    groupedByCategory[summary.category]?.map((row) => (
                      <WorkflowRow
                        key={row.workflowKey}
                        row={row}
                        gridColumns={gridColumns}
                        onToggleChannel={toggleChannel}
                        onToggleEnforced={toggleEnforced}
                      />
                    ))}
                </div>
              ))}
            </div>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            onClick={handleSave}
            disabled={isLoading || isError || !canSave}
          >
            {tc('save')}
          </Button>
          <Button variant={'neutral'} style={'outline'} onClick={onClose}>
            {tc('cancel')}
          </Button>
        </Dialog.Footer>
      </Dialog>

      <ConfirmSaveDialog
        open={showConfirm}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </>
  );
};

export default TenantNotificationPreferencesModal;
