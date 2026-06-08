import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getLinkedItemRisksQueryConfig,
  getLinkedItemsQueryConfig,
  getLinkedRisksByInternalAuditIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/linked-item.query';
import { impact_rating } from '@risksmart-app/drizzle/src/schema';
import { and, desc, inArray } from 'drizzle-orm';

import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import { filterLinkedItems } from '../../utils/filtering';
import { sortByDateDesc } from '../../utils/sorting';
import type { LinkedItemService, ServiceContext } from '../service.types';

/**
 * Deduplicates linked items by creating a canonical key from sorted [Source, Target].
 * This handles bidirectional sibling relationships where both (A→B) and (B→A) exist.
 * For non-sibling relationships, all records are kept.
 */
const deduplicateLinkedItems = <
  T extends { Source: string; Target: string; RelationshipType: string | null },
>(
  items: T[]
): T[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    // Only deduplicate siblings - parent_child/child_parent are distinct
    if (item.RelationshipType !== 'sibling') {
      return true;
    }
    // Create canonical key regardless of direction
    const key = [item.Source, item.Target].sort().join('-');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);

    return true;
  });
};

export class LinkedItemServiceImpl implements LinkedItemService {
  async getLinkedItems(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.linked_item.findMany({
        where: {
          Source: id,
        },
        ...getLinkedItemsQueryConfig,
      });
    });

    // Deduplicate bidirectional siblings (both directions exist in DB)
    const uniqueData = deduplicateLinkedItems(data);

    const filteredItems = await filterLinkedItems(uniqueData, ctx);

    return filteredItems;
  }

  async getLinkedRisksByInternalAuditId(
    ctx: ServiceContext,
    internalAuditId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const linkedRisks = await db.org((tx) => {
      return tx.query.linked_item.findMany({
        where: {
          Source: internalAuditId,
          target_node: { ObjectType: ParentTypes.Risk },
        },
        ...getLinkedRisksByInternalAuditIdQueryConfig,
      });
    });

    // Deduplicate bidirectional siblings (both directions exist in DB)
    const uniqueLinkedRisks = deduplicateLinkedItems(linkedRisks);

    const linkedRisksWithTargets = uniqueLinkedRisks
      .filter((linkedRisk) => !!linkedRisk.target_risk)
      .map((linkedRisk) => ({
        ...linkedRisk,
        target_risk: linkedRisk.target_risk!,
      }));

    const filteredLinkedRisks = await filterLinkedItems(
      linkedRisksWithTargets,
      ctx
    );

    filteredLinkedRisks.forEach((linkedRisk) => {
      linkedRisk.target_risk?.appetites.sort((a, b) =>
        sortByDateDesc(
          a.appetite,
          b.appetite,
          'EffectiveDate',
          'CreatedAtTimestamp'
        )
      );
    });

    filteredLinkedRisks.forEach((linkedRisk) => {
      linkedRisk.target_risk?.assessmentResults.sort((a, b) =>
        sortByDateDesc(
          a.riskAssessmentResult,
          b.riskAssessmentResult,
          'TestDate',
          'CreatedAtTimestamp'
        )
      );
    });

    const impactRatings =
      filteredLinkedRisks.length > 0
        ? await db.org((tx) => {
            return tx
              .selectDistinctOn([impact_rating.ImpactId], {
                Rating: impact_rating.Rating,
                ImpactId: impact_rating.ImpactId,
                RatedItemId: impact_rating.RatedItemId,
              })
              .from(impact_rating)
              .where(
                and(
                  inArray(
                    impact_rating.RatedItemId,
                    filteredLinkedRisks.map((item) => item.target_risk.Id)
                  ),
                  inArray(impact_rating.RatingType, RATING_TYPE_ASSESSMENT)
                )
              )
              .orderBy(
                desc(impact_rating.ImpactId),
                desc(impact_rating.TestDate)
              );
          })
        : [];

    // Fetch impact ratings for trend calculation (last 10 per risk, ordered by date)
    const impactRatingsForTrend =
      filteredLinkedRisks.length > 0
        ? await db.org((tx) => {
            return tx
              .select({
                Rating: impact_rating.Rating,
                ImpactId: impact_rating.ImpactId,
                RatedItemId: impact_rating.RatedItemId,
                TestDate: impact_rating.TestDate,
              })
              .from(impact_rating)
              .where(
                and(
                  inArray(
                    impact_rating.RatedItemId,
                    filteredLinkedRisks.map((item) => item.target_risk.Id)
                  ),
                  inArray(impact_rating.RatingType, RATING_TYPE_ASSESSMENT)
                )
              )
              .orderBy(desc(impact_rating.TestDate))
              .limit(10);
          })
        : [];

    const impactRatingsByRatedItemId = new Map<string, typeof impactRatings>();
    for (const impactRating of impactRatings) {
      if (!impactRatingsByRatedItemId.has(impactRating.RatedItemId)) {
        impactRatingsByRatedItemId.set(impactRating.RatedItemId, []);
      }
      impactRatingsByRatedItemId
        .get(impactRating.RatedItemId)!
        .push(impactRating);
    }

    const impactRatingsForTrendByRatedItemId = new Map<
      string,
      typeof impactRatingsForTrend
    >();
    for (const impactRating of impactRatingsForTrend) {
      if (!impactRatingsForTrendByRatedItemId.has(impactRating.RatedItemId)) {
        impactRatingsForTrendByRatedItemId.set(impactRating.RatedItemId, []);
      }
      impactRatingsForTrendByRatedItemId
        .get(impactRating.RatedItemId)!
        .push(impactRating);
    }

    return filteredLinkedRisks.map((linkedRisk) => ({
      ...linkedRisk,
      target_risk: {
        ...linkedRisk.target_risk,
        appetites: linkedRisk.target_risk.appetites[0]
          ? [linkedRisk.target_risk.appetites[0]]
          : [],
        impactRatings: (
          impactRatingsByRatedItemId.get(linkedRisk.target_risk.Id) || []
        ).map((impactRating) => ({
          Rating: impactRating.Rating,
          ImpactId: impactRating.ImpactId,
        })),
        impactRatingsForTrend: (
          impactRatingsForTrendByRatedItemId.get(linkedRisk.target_risk.Id) ||
          []
        ).map((impactRating) => ({
          ImpactId: impactRating.ImpactId,
          Rating: impactRating.Rating,
          TestDate: String(impactRating.TestDate),
        })),
        controls_aggregate: {
          aggregate: { count: linkedRisk.target_risk?.controls.length ?? 0 },
        },
        indicators_aggregate: {
          aggregate: { count: linkedRisk.target_risk?.indicators.length ?? 0 },
        },
        actions_aggregate: {
          aggregate: { count: linkedRisk.target_risk?.actions.length ?? 0 },
        },
      },
    }));
  }
  async getLinkedItemRisks(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.linked_item.findMany({
        where: {
          Source: id,
          target_node: { ObjectType: ParentTypes.Risk },
        },
        ...getLinkedItemRisksQueryConfig,
      });
    });

    // Deduplicate bidirectional siblings (both directions exist in DB)
    const uniqueData = deduplicateLinkedItems(data);

    const filteredItems = await filterLinkedItems(uniqueData, ctx);

    return filteredItems;
  }
}
