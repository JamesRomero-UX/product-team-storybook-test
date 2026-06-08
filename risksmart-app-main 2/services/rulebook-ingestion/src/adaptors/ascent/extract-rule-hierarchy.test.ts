import { createContentHash } from 'src/domain/create-content-hash';
import {
  buildAscentRule,
  withChapterId,
  withId,
  withStandardId,
} from 'test/adaptors/ascent-rule-builder';
import {
  buildRawExternalObligation,
  withJson,
} from 'test/builders/raw-external-obligation-builder';

import { createExtractRuleHierarchy } from './extract-rule-hierarchy';

describe('extract rule hierarchy', () => {
  it('should extract a new obligation with narrowed parent content hash for standard type', () => {
    const { extractRuleHierarchy } = createExtractRuleHierarchy();

    const standardId = 'standard-123';
    const chapterId = 'chapter-789';
    const standardName = '3 SII Firms';
    const standardPosition = 3;

    const ascentRule = buildAscentRule(
      withId('rule-456'),
      withChapterId(chapterId),
      withStandardId(standardId)
    );

    const rawObligation = buildRawExternalObligation(
      withJson(JSON.stringify(ascentRule))
    );

    const result = extractRuleHierarchy([rawObligation]);

    // Calculate expected narrowed hash based only on standard metadata
    const expectedHash = createContentHash(
      JSON.stringify({
        id: standardId,
        name: standardName,
        position: standardPosition,
      })
    );

    expect(result.standards[0]!).toEqual({
      contentHash: expectedHash,
      description: undefined,
      externalId: standardId,
      externalRegulatorId: ascentRule.attributes.hierarchy[2]!.id,
      provider: 'ascent',
      regulatorName: ascentRule.attributes.hierarchy[2]!.name,
      tags: [],
      title: standardName,
      type: 'standard',
      sequence: standardPosition,
    });
    // Verify the hash is different from the raw obligation's content hash
    expect(result.standards[0]!.contentHash).not.toBe(
      rawObligation.contentHash
    );
  });

  it('should extract a new obligation with narrowed parent content hash for chapter type', () => {
    const { extractRuleHierarchy } = createExtractRuleHierarchy();

    const chapterId = 'chapter-789';
    const chapterName = 'Insurance - Allocation of Responsibilities';
    const chapterPosition = 15;
    const standardId = 'standard-123';
    const standardName = '3 SII Firms';
    const standardPosition = 3;
    const ascentRule = buildAscentRule(
      withId('rule-456'),
      withChapterId(chapterId),
      withStandardId(standardId)
    );
    const rawObligation = buildRawExternalObligation(
      withJson(JSON.stringify(ascentRule))
    );
    const result = extractRuleHierarchy([rawObligation]);

    // Calculate expected narrowed hash based on chapter and standard metadata
    const expectedHash = createContentHash(
      JSON.stringify({
        hierarchyStandard: {
          id: standardId,
          name: standardName,
          position: standardPosition,
        },
        hierarchyChapter: {
          id: chapterId,
          name: chapterName,
          position: chapterPosition,
        },
      })
    );
    expect(result.chapters[0]!).toEqual({
      contentHash: expectedHash,
      description: undefined,
      externalId: chapterId,
      externalParentId: standardId,
      externalRegulatorId: ascentRule.attributes.hierarchy[2]!.id,
      provider: 'ascent',
      regulatorName: ascentRule.attributes.hierarchy[2]!.name,
      sequence: 15,
      tags: [],
      title: chapterName,
      type: 'chapter',
    });
    // Verify the hash is different from the raw obligation's content hash
    expect(result.chapters[0]!.contentHash).not.toBe(rawObligation.contentHash);
  });

  it('should deduplicate standards and chapters across multiple calls within the same closure', () => {
    const { extractRuleHierarchy } = createExtractRuleHierarchy();

    const standardId = 'standard-123';
    const chapterId = 'chapter-789';

    // First batch: 2 rules from the same standard and chapter
    const batch1 = [
      buildRawExternalObligation(
        withJson(
          JSON.stringify(
            buildAscentRule(
              withId('rule-1'),
              withStandardId(standardId),
              withChapterId(chapterId)
            )
          )
        )
      ),
      buildRawExternalObligation(
        withJson(
          JSON.stringify(
            buildAscentRule(
              withId('rule-2'),
              withStandardId(standardId),
              withChapterId(chapterId)
            )
          )
        )
      ),
    ];

    // Second batch: 2 more rules from the SAME standard and chapter (duplicates)
    const batch2 = [
      buildRawExternalObligation(
        withJson(
          JSON.stringify(
            buildAscentRule(
              withId('rule-3'),
              withStandardId(standardId),
              withChapterId(chapterId)
            )
          )
        )
      ),
      buildRawExternalObligation(
        withJson(
          JSON.stringify(
            buildAscentRule(
              withId('rule-4'),
              withStandardId(standardId),
              withChapterId(chapterId)
            )
          )
        )
      ),
    ];

    // Third batch: rules from a NEW standard and chapter
    const newStandardId = 'standard-456';
    const newChapterId = 'chapter-999';
    const batch3 = [
      buildRawExternalObligation(
        withJson(
          JSON.stringify(
            buildAscentRule(
              withId('rule-5'),
              withStandardId(newStandardId),
              withChapterId(newChapterId)
            )
          )
        )
      ),
    ];

    // First call: should extract 1 standard and 1 chapter
    const result1 = extractRuleHierarchy(batch1);
    expect(result1.standards).toHaveLength(1);
    expect(result1.chapters).toHaveLength(1);
    expect(result1.standards[0]!.externalId).toBe(standardId);
    expect(result1.chapters[0]!.externalId).toBe(chapterId);

    // Second call: should return empty (already seen)
    const result2 = extractRuleHierarchy(batch2);
    expect(result2.standards).toHaveLength(0);
    expect(result2.chapters).toHaveLength(0);

    // Third call: should extract 1 new standard and 1 new chapter
    const result3 = extractRuleHierarchy(batch3);
    expect(result3.standards).toHaveLength(1);
    expect(result3.chapters).toHaveLength(1);
    expect(result3.standards[0]!.externalId).toBe(newStandardId);
    expect(result3.chapters[0]!.externalId).toBe(newChapterId);
  });
});
