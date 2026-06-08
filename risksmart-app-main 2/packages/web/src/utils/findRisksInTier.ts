export type DashboardState = Map<number, string | undefined>;

export interface TierCard {
  Id: string;
  Title?: string | null;
  Tier?: number | null;
  unlinked?: boolean;
}

export const createFindRisksInTier =
  <T extends TierCard>(getParentId: (risk: T) => string | null | undefined) =>
  (
    tier: 1 | 2 | 3,
    risks: T[],
    dashboardState: DashboardState,
    parentRiskId?: string
  ): T[] => {
    const isTopTier = tier === 1;

    const risksInCurrentTier = risks
      .filter((risk) => risk.Tier === tier)
      .filter((risk) => !risk.unlinked);

    const riskIdsInParentTier = !isTopTier
      ? risks
          .filter((risk) => risk.Tier === tier - 1)
          .filter((risk) => !risk.unlinked)
          .map((risk) => risk.Id)
      : [];

    const risksInChildTier = risks
      .filter((risk) => risk.Tier === tier + 1)
      .filter((risk) => !risk.unlinked);

    const hasUnlinkedRisksInChildTier = Boolean(
      risksInChildTier.filter(
        (risk) =>
          !risk.unlinked &&
          !risksInCurrentTier
            .map((risk) => risk.Id)
            .includes(getParentId(risk) || '')
      ).length > 0
    );

    const noRiskSelected = Boolean(dashboardState.get(tier - 1)?.length === 0);
    if (!isTopTier && noRiskSelected) {
      return [];
    }

    return risks
      .filter((risk) => risk.Tier === tier)
      .filter((risk) => {
        if (!risk.unlinked && isTopTier) {
          return true;
        }

        if (
          !risk.unlinked &&
          parentRiskId === 'unlinked' &&
          !riskIdsInParentTier.includes(getParentId(risk) || '')
        ) {
          return true;
        }

        if (!risk.unlinked && getParentId(risk) === parentRiskId) {
          return true;
        }

        if (risk.unlinked && hasUnlinkedRisksInChildTier) {
          return true;
        }

        return false;
      })
      .sort((a, b) => {
        // Keep "Unlinked Risks" pinned at the bottom
        if (a.unlinked) {
          return 1;
        }
        if (b.unlinked) {
          return -1;
        }

        return (a.Title ?? '').localeCompare(b.Title ?? '', undefined, {
          sensitivity: 'base',
        });
      });
  };
