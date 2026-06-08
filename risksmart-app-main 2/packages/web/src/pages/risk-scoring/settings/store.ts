/**
 * Raw Zustand store for risk scoring settings.
 *
 * Contains only mutable state and the actions that modify it.
 * Derived / computed values belong in useRiskScoringSettingsStore.ts.
 */
import type { ImpactCategory, MatrixCell, RiskScoringLevel } from 'src/blocks';
import { create } from 'zustand';

export interface ScoringSettingsData {
  likelihoodLevels: RiskScoringLevel[];
  impactLevels: RiskScoringLevel[];
  impactCategories: ImpactCategory[];
  impactAggregation: 'average' | 'maximum';
  matrix: MatrixCell[];
  id: string;
  originalTimestamp: string;
}

type State = {
  // Data
  current: ScoringSettingsData | null;
  initial: ScoringSettingsData | null;

  // UI flags
  isMultiImpactEnabled: boolean;
  selectedMethodology: 'impact-likelihood' | 'multi-impact';
  isMatrixInverted: boolean;
  stashedImpactCategories: ImpactCategory[];

  // Editing dialogs
  editingLevel: {
    type: 'likelihood' | 'impact';
    level: RiskScoringLevel;
  } | null;
  editingImpactCategory: ImpactCategory | null;
  editingMatrixCell: MatrixCell | null;
};

type Actions = {
  // Lifecycle
  hydrate: (data: ScoringSettingsData) => void;
  reset: () => void;
  resetToInitial: () => void;

  // Likelihood levels
  addLikelihoodLevel: () => void;
  deleteLikelihoodLevel: (value: number) => void;
  updateLikelihoodLevel: (
    originalValue: number,
    level: RiskScoringLevel
  ) => void;

  // Impact levels
  addImpactLevel: () => void;
  deleteImpactLevel: (value: number) => void;
  updateImpactLevel: (originalValue: number, level: RiskScoringLevel) => void;

  // Impact categories
  addImpactCategory: () => void;
  deleteImpactCategory: (name: string) => void;
  updateImpactCategory: (originalName: string, updated: ImpactCategory) => void;

  // Matrix
  updateMatrixCell: (cell: MatrixCell) => void;

  // UI flags
  setMultiImpactEnabled: (enabled: boolean) => void;
  setSelectedMethodology: (
    methodology: 'impact-likelihood' | 'multi-impact'
  ) => void;
  setMatrixInverted: (inverted: boolean) => void;
  setImpactAggregation: (aggregation: 'average' | 'maximum') => void;

  // Editing dialogs
  setEditingLevel: (
    editing: { type: 'likelihood' | 'impact'; level: RiskScoringLevel } | null
  ) => void;
  setEditingImpactCategory: (category: ImpactCategory | null) => void;
  setEditingMatrixCell: (cell: MatrixCell | null) => void;
  confirmEditLevel: (level: RiskScoringLevel) => void;
  confirmEditImpactCategory: (updated: ImpactCategory) => void;
  confirmEditMatrixCell: (cell: MatrixCell) => void;
};

const getNextValue = (levels: { value: number }[]) => {
  if (levels.length === 0) {
    return 1;
  }

  return Math.max(...levels.map((level) => level.value)) + 1;
};

const initialState: State = {
  // Data
  current: null,
  initial: null,

  // UI flags
  isMultiImpactEnabled: false,
  selectedMethodology: 'impact-likelihood',
  isMatrixInverted: false,
  stashedImpactCategories: [],

  // Editing dialogs
  editingLevel: null,
  editingImpactCategory: null,
  editingMatrixCell: null,
};

export const useInternalStore = create<State & Actions>()((set, get) => ({
  ...initialState,

  // Lifecycle

  hydrate: (data) => {
    const hasCategories = data.impactCategories.length > 0;
    set({
      current: data,
      initial: data,
      isMultiImpactEnabled: hasCategories,
      selectedMethodology: 'impact-likelihood',
      stashedImpactCategories: [],
      editingLevel: null,
      editingImpactCategory: null,
      editingMatrixCell: null,
    });
  },

  reset: () => {
    set(initialState);
  },

  resetToInitial: () => {
    const { initial } = get();
    const hasCategories = (initial?.impactCategories.length ?? 0) > 0;
    set({
      current: initial,
      stashedImpactCategories: [],
      isMultiImpactEnabled: hasCategories,
      selectedMethodology: 'impact-likelihood',
      editingLevel: null,
      editingImpactCategory: null,
      editingMatrixCell: null,
    });
  },

  // Likelihood levels

  addLikelihoodLevel: () => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      const nextValue = getNextValue(state.current.likelihoodLevels);
      const fallbackColor =
        state.current.likelihoodLevels[
          state.current.likelihoodLevels.length - 1
        ]?.color ?? '#E5E7EB';

      return {
        current: {
          ...state.current,
          likelihoodLevels: [
            ...state.current.likelihoodLevels,
            {
              value: nextValue,
              title: `Level ${nextValue}`,
              description: '-',
              color: fallbackColor,
            },
          ],
        },
      };
    });
  },

  deleteLikelihoodLevel: (value) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return {
        current: {
          ...state.current,
          likelihoodLevels: state.current.likelihoodLevels.filter(
            (level) => level.value !== value
          ),
          matrix: state.current.matrix.filter(
            (entry) => entry.likelihood !== value
          ),
        },
      };
    });
  },

  updateLikelihoodLevel: (originalValue, level) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      const valueChanged = originalValue !== level.value;

      return {
        current: {
          ...state.current,
          likelihoodLevels: state.current.likelihoodLevels.map((l) =>
            l.value === originalValue ? level : l
          ),
          matrix: valueChanged
            ? state.current.matrix.map((entry) =>
                entry.likelihood === originalValue
                  ? { ...entry, likelihood: level.value }
                  : entry
              )
            : state.current.matrix,
        },
      };
    });
  },

  // Impact levels

  addImpactLevel: () => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      const nextValue = getNextValue(state.current.impactLevels);
      const fallbackColor =
        state.current.impactLevels[state.current.impactLevels.length - 1]
          ?.color ?? '#E5E7EB';

      return {
        current: {
          ...state.current,
          impactLevels: [
            ...state.current.impactLevels,
            {
              value: nextValue,
              title: `Level ${nextValue}`,
              description: '-',
              color: fallbackColor,
            },
          ],
        },
      };
    });
  },

  deleteImpactLevel: (value) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return {
        current: {
          ...state.current,
          impactLevels: state.current.impactLevels.filter(
            (level) => level.value !== value
          ),
          matrix: state.current.matrix.filter(
            (entry) => entry.impact !== value
          ),
        },
      };
    });
  },

  updateImpactLevel: (originalValue, level) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      const valueChanged = originalValue !== level.value;

      return {
        current: {
          ...state.current,
          impactLevels: state.current.impactLevels.map((l) =>
            l.value === originalValue ? level : l
          ),
          matrix: valueChanged
            ? state.current.matrix.map((entry) =>
                entry.impact === originalValue
                  ? { ...entry, impact: level.value }
                  : entry
              )
            : state.current.matrix,
        },
      };
    });
  },

  // Impact categories

  addImpactCategory: () => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return {
        current: {
          ...state.current,
          impactCategories: [
            ...state.current.impactCategories,
            {
              name: `New Category ${state.current.impactCategories.length + 1}`,
              color: '#474771',
            },
          ],
        },
      };
    });
  },

  deleteImpactCategory: (name) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return {
        current: {
          ...state.current,
          impactCategories: state.current.impactCategories.filter(
            (category) => category.name !== name
          ),
        },
      };
    });
  },

  updateImpactCategory: (originalName, updated) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return {
        current: {
          ...state.current,
          impactCategories: state.current.impactCategories.map((c) =>
            c.name === originalName ? updated : c
          ),
        },
      };
    });
  },

  // Matrix

  updateMatrixCell: (cell) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      const { matrix } = state.current;

      // Find existing entry for this cell
      const ownerIndex = matrix.findIndex(
        (entry) =>
          entry.likelihood === cell.likelihood && entry.impact === cell.impact
      );

      if (ownerIndex !== -1) {
        // Update in place
        return {
          current: {
            ...state.current,
            matrix: matrix.map((entry, i) =>
              i === ownerIndex
                ? {
                    title: cell.title,
                    value: cell.value,
                    color: cell.color,
                    likelihood: entry.likelihood,
                    impact: entry.impact,
                  }
                : entry
            ),
          },
        };
      }

      // New cell — create a standalone entry
      return {
        current: {
          ...state.current,
          matrix: [
            ...matrix,
            {
              title: cell.title,
              value: cell.value,
              color: cell.color,
              likelihood: cell.likelihood,
              impact: cell.impact,
            },
          ],
        },
      };
    });
  },

  // UI flags

  setMultiImpactEnabled: (enabled) => {
    set((state) => {
      if (!state.current) {
        return { isMultiImpactEnabled: enabled };
      }

      if (enabled) {
        return {
          isMultiImpactEnabled: true,
          stashedImpactCategories: [],
          current: {
            ...state.current,
            impactCategories: state.stashedImpactCategories,
          },
        };
      }

      return {
        isMultiImpactEnabled: false,
        stashedImpactCategories: state.current.impactCategories,
        current: {
          ...state.current,
          impactCategories: [],
        },
      };
    });
  },

  setSelectedMethodology: (methodology) => {
    set({ selectedMethodology: methodology });
  },

  setMatrixInverted: (inverted) => {
    set({ isMatrixInverted: inverted });
  },

  setImpactAggregation: (aggregation) => {
    set((state) => {
      if (!state.current) {
        return state;
      }

      return { current: { ...state.current, impactAggregation: aggregation } };
    });
  },

  // Editing dialogs

  setEditingLevel: (editing) => set({ editingLevel: editing }),
  setEditingImpactCategory: (category) =>
    set({ editingImpactCategory: category }),
  setEditingMatrixCell: (cell) => set({ editingMatrixCell: cell }),

  confirmEditLevel: (level) => {
    const { editingLevel, updateLikelihoodLevel, updateImpactLevel } = get();
    if (!editingLevel) {
      return;
    }
    const originalValue = editingLevel.level.value;
    if (editingLevel.type === 'likelihood') {
      updateLikelihoodLevel(originalValue, level);
    } else {
      updateImpactLevel(originalValue, level);
    }
    set({ editingLevel: null });
  },

  confirmEditImpactCategory: (updated) => {
    const { editingImpactCategory, updateImpactCategory } = get();
    if (!editingImpactCategory) {
      return;
    }
    updateImpactCategory(editingImpactCategory.name, updated);
    set({ editingImpactCategory: null });
  },

  confirmEditMatrixCell: (cell) => {
    const { updateMatrixCell } = get();
    updateMatrixCell(cell);
    set({ editingMatrixCell: null });
  },
}));
