import { createContentHash } from '../../domain/create-content-hash';
import type {
  NewRawExternalObligation,
  Obligation,
  UnlinkedObligation,
} from '../../domain/types';
import { getLogger } from '../../logger';
import type { AscentRule } from './types';
import { ascentRuleSchema } from './types';

const logger = getLogger();

export const createExtractRuleHierarchy = () => {
  const seenStandardIds = new Set<string>();
  const seenChapterIds = new Set<string>();

  interface HierarchyEntity {
    id: string;
    name: string;
    position?: number;
  }

  const getChapterFromHierarchy = (rule: AscentRule): HierarchyEntity => {
    if (!rule.attributes.hierarchy[0]) {
      logger.error('Chapter not found in rule hierarchy', {
        externalRuleId: rule.id,
        hierarchy: rule.attributes.hierarchy,
      });

      throw new Error('Chapter not found in rule hierarchy');
    }

    return {
      id: rule.attributes.hierarchy[0].id,
      name: rule.attributes.hierarchy[0].name,
      position: rule.attributes.hierarchy[0].position,
    };
  };

  const getStandardFromHierarchy = (rule: AscentRule): HierarchyEntity => {
    if (!rule.attributes.hierarchy[1]) {
      logger.error('Standard not found in rule hierarchy', {
        externalRuleId: rule.id,
        hierarchy: rule.attributes.hierarchy,
      });

      throw new Error('Standard not found in rule hierarchy');
    }

    return {
      id: rule.attributes.hierarchy[1].id,
      name: rule.attributes.hierarchy[1].name,
      position: rule.attributes.hierarchy[1].position,
    };
  };

  const getRegulatorFromHierarchy = (
    rule: AscentRule
  ): { id: string; name: string } => {
    if (!rule.attributes.hierarchy[2]) {
      logger.error('Regulator not found in rule hierarchy', {
        externalRuleId: rule.id,
        hierarchy: rule.attributes.hierarchy,
      });

      throw new Error('Regulator not found in rule hierarchy');
    }

    return {
      id: rule.attributes.hierarchy[2].id,
      name: rule.attributes.hierarchy[2].name,
    };
  };

  const extractStandardFromHierarchy = (
    hierarchyStandard: HierarchyEntity,
    hierarchyRegulator: {
      id: string;
      name: string;
    }
  ): UnlinkedObligation => {
    const narrowedHash = createContentHash(JSON.stringify(hierarchyStandard));

    return {
      contentHash: narrowedHash,
      description: undefined,
      externalId: hierarchyStandard.id,
      externalRegulatorId: hierarchyRegulator.id,
      provider: 'ascent',
      regulatorName: hierarchyRegulator.name,
      sequence: hierarchyStandard.position,
      tags: [],
      title: hierarchyStandard.name,
      type: 'standard',
    } satisfies UnlinkedObligation;
  };

  const extractChapterFromHierarchy = (
    hierarchyStandard: HierarchyEntity,
    hierarchyChapter: HierarchyEntity,
    hierarchyRegulator: {
      id: string;
      name: string;
    }
  ): Obligation => {
    const narrowedHash = createContentHash(
      JSON.stringify({ hierarchyStandard, hierarchyChapter })
    );

    return {
      contentHash: narrowedHash,
      description: undefined,
      externalId: hierarchyChapter.id,
      externalParentId: hierarchyStandard.id,
      externalRegulatorId: hierarchyRegulator.id,
      provider: 'ascent',
      regulatorName: hierarchyRegulator.name,
      sequence: hierarchyChapter.position,
      tags: [],
      title: hierarchyChapter.name,
      type: 'chapter',
    } satisfies Obligation;
  };

  /**
   * Tracks seen standard and chapter IDs to avoid duplicates, as multiple rules may belong to the same standard/chapter.
   * Extracts standards and chapters from the rule hierarchy and returns them as separate lists.
   * @param rawObligations
   * @returns Lists of unique standards and chapters extracted from the rule hierarchy
   */
  const extractRuleHierarchy = (
    rawObligations: NewRawExternalObligation[]
  ): { standards: Obligation[]; chapters: Obligation[] } => {
    const result: { standards: Obligation[]; chapters: Obligation[] } = {
      standards: [],
      chapters: [],
    };

    for (const raw of rawObligations) {
      if (raw.json && raw.type === 'rule') {
        const rule = ascentRuleSchema.parse(JSON.parse(raw.json));

        const standard = getStandardFromHierarchy(rule);
        const chapter = getChapterFromHierarchy(rule);
        const regulator = getRegulatorFromHierarchy(rule);

        if (!seenStandardIds.has(standard.id)) {
          seenStandardIds.add(standard.id);
          result.standards.push(
            extractStandardFromHierarchy(standard, regulator)
          );
        }

        if (!seenChapterIds.has(chapter.id)) {
          seenChapterIds.add(chapter.id);
          result.chapters.push(
            extractChapterFromHierarchy(standard, chapter, regulator)
          );
        }
      }
    }

    return result;
  };

  return { extractRuleHierarchy };
};
