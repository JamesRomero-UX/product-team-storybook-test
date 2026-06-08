import { ApolloError } from '@apollo/client';
import { SpaceBetween } from '@risk-smart/themed-cloudscape-components';
import { Container } from '@risksmart-app/atomic-ui';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiskScoringSettings } from 'src/blocks';
import {
  useInsertRiskAssessmentResultConfig,
  useUpdateRiskAssessmentResultConfig,
} from 'src/hooks/mutations';
import { PageLayout } from 'src/layouts';

import { DiscardDialog } from './dialogs/DiscardDialog';
import { EditImpactCategoryDialog } from './dialogs/EditImpactCategoryDialog';
import { EditLevelDialog } from './dialogs/EditLevelDialog';
import { EditMatrixCellDialog } from './dialogs/EditMatrixCellDialog';
import { SaveDialog } from './dialogs/SaveDialog';
import { buildLang } from './lang';
import { transformToApiConfig } from './transform';
import { useRiskScoringSettingsStore } from './useRiskScoringSettingsStore';

const isConflictError = (error: unknown): boolean =>
  error instanceof ApolloError &&
  error.graphQLErrors.some((e) => {
    // extensions may be an object {code} or an array [{code}] depending on the backend
    const ext = Array.isArray(e.extensions) ? e.extensions[0] : e.extensions;

    return ext?.code === 'modified-since-last-view';
  });

const Page = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'riskScoringSettings',
  });
  const {
    state,
    actions,
    isLoading,
    id,
    originalTimestamp,
    areSettingsComplete,
    requiresNewVersion,
    resetToInitial,
    refetch,
    editingLevel,
    editingImpactCategory,
    editingMatrixCell,
    setEditingLevel,
    setEditingImpactCategory,
    setEditingMatrixCell,
    confirmEditLevel,
    confirmEditImpactCategory,
    confirmEditMatrixCell,
  } = useRiskScoringSettingsStore();
  const { mutate: updateConfig } = useUpdateRiskAssessmentResultConfig();
  const { mutate: insertConfig } = useInsertRiskAssessmentResultConfig();
  const { addNotification } = useNotifications();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);

  const handleSave = async (mode: 'update' | 'insert') => {
    if (mode === 'update') {
      setIsUpdating(true);
    } else {
      setIsInserting(true);
    }

    try {
      const config = transformToApiConfig({
        likelihoodLevels: state.likelihoodLevels,
        impactLevels: state.impactLevels,
        impactCategories: state.impactCategories,
        impactAggregation: state.impactAggregation,
        matrix: state.matrix,
      });

      if (mode === 'update') {
        await updateConfig({
          variables: {
            Id: id!,
            Config: config,
            OriginalTimestamp: originalTimestamp!,
          },
        });
      } else {
        await insertConfig({
          variables: { Config: config },
        });
      }

      setShowSaveDialog(false);
      addNotification({
        type: 'success',
        content: t(
          mode === 'update'
            ? 'saveDialog.updateSuccessMessage'
            : 'saveDialog.saveAsNewSuccessMessage'
        ),
      });
      await refetch();
    } catch (error: unknown) {
      setShowSaveDialog(false);

      if (isConflictError(error)) {
        addNotification({
          type: 'error',
          content: (error as ApolloError).graphQLErrors[0].message,
        });
      } else {
        addNotification({
          type: 'error',
          content: t(
            mode === 'update'
              ? 'saveDialog.updateErrorMessage'
              : 'saveDialog.saveAsNewErrorMessage'
          ),
        });
      }
    } finally {
      if (mode === 'update') {
        setIsUpdating(false);
      } else {
        setIsInserting(false);
      }
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    resetToInitial();
    addNotification({
      type: 'success',
      content: t('discardDialog.successMessage'),
    });
  };

  const existingLevelsForDialog = useMemo(() => {
    if (!editingLevel) {
      return [];
    }
    const levels =
      editingLevel.type === 'likelihood'
        ? state.likelihoodLevels
        : state.impactLevels;

    return levels.filter((l) => l.value !== editingLevel.level.value);
  }, [editingLevel, state.likelihoodLevels, state.impactLevels]);

  const existingCategoriesForDialog = useMemo(
    () =>
      editingImpactCategory
        ? state.impactCategories.filter(
            (c) => c.name !== editingImpactCategory.name
          )
        : [],
    [editingImpactCategory, state.impactCategories]
  );

  const lang = buildLang(t);

  if (isLoading) {
    return <PageLayout title={t('page.title')} />;
  }

  return (
    <PageLayout
      title={t('page.title')}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            variant={'primary'}
            formAction={'none'}
            onClick={() => setShowSaveDialog(true)}
            disabled={
              state.changeStatus === 'none' || isLoading || !areSettingsComplete
            }
          >
            {t('page.saveButton')}
          </Button>
          <Button
            variant={'normal'}
            formAction={'none'}
            onClick={() => setShowDiscardDialog(true)}
            disabled={state.changeStatus === 'none' || isLoading}
          >
            {t('page.discardButton')}
          </Button>
        </SpaceBetween>
      }
    >
      <Container className={'mx-auto'}>
        <RiskScoringSettings lang={lang} state={state} actions={actions} />
      </Container>

      <SaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onUpdate={() => handleSave('update')}
        onInsert={() => handleSave('insert')}
        isUpdating={isUpdating}
        isInserting={isInserting}
        requiresNewVersion={requiresNewVersion}
      />
      <DiscardDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onDiscard={handleDiscard}
      />
      <EditImpactCategoryDialog
        open={editingImpactCategory !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingImpactCategory(null);
          }
        }}
        category={editingImpactCategory}
        onSave={confirmEditImpactCategory}
        existingCategories={existingCategoriesForDialog}
      />
      <EditMatrixCellDialog
        open={editingMatrixCell !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMatrixCell(null);
          }
        }}
        cell={editingMatrixCell}
        onSave={confirmEditMatrixCell}
      />
      <EditLevelDialog
        open={editingLevel !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLevel(null);
          }
        }}
        level={editingLevel?.level ?? null}
        type={editingLevel?.type ?? 'impact'}
        onSave={confirmEditLevel}
        existingLevels={existingLevelsForDialog}
      />
    </PageLayout>
  );
};

export default Page;
