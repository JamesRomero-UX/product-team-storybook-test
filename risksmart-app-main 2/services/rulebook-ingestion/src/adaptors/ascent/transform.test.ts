import {
  buildAscentRule,
  withChapterId,
  withId,
  withRegulatorId,
} from 'test/adaptors/ascent-rule-builder';
import {
  buildAscentTask,
  withId as withTaskId,
  withRegulatorId as withTaskRegulatorId,
  withRuleId,
} from 'test/adaptors/ascent-task-builder';
import {
  buildRawExternalObligation,
  withExternalId,
  withJson,
} from 'test/builders/raw-external-obligation-builder';

import {
  transformRawObligationFromAscentItem,
  transformRegulatorFromAscentApi,
  transformRuleToObligation,
  transformTaskToObligation,
} from './transform';
import type { AscentRegulator } from './types';

describe('Ascent transformations', () => {
  describe('transformRegulatorFromAscentApi', () => {
    it('should transform Ascent regulator data to domain regulator', () => {
      const ascentRegulator: AscentRegulator = {
        id: 'reg-123',
        type: 'regulator',
        attributes: {
          name: 'Test Regulator',
          regionLocation: 'Test Region',
          countryLocation: 'Test Country',
          stateTerritoryLocation: 'Test State',
          links: {
            app: 'https://test.app',
          },
        },
      };

      const result = transformRegulatorFromAscentApi(ascentRegulator);

      expect(result).toEqual({
        id: ascentRegulator.id,
        name: ascentRegulator.attributes.name,
      });
    });
  });

  describe('transformRawObligationFromAscentItem', () => {
    it('should transform a single Ascent rule to raw external obligation', () => {
      const ruleId = 'rule-123';
      const chapterId = 'chapter-456';
      const ascentRule = buildAscentRule(
        withId(ruleId),
        withChapterId(chapterId)
      );

      const result = transformRawObligationFromAscentItem([ascentRule]);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        externalId: ascentRule.id,
        externalParentId: chapterId, // From hierarchy[0]
        type: 'rule',
        json: JSON.stringify(ascentRule),
      });
      expect(result[0]!.contentHash).toBeDefined();
    });

    it('should transform multiple Ascent rules to raw external obligations', () => {
      const rule1 = buildAscentRule(withId('rule-1'));
      const rule2 = buildAscentRule(withId('rule-2'));

      const result = transformRawObligationFromAscentItem([rule1, rule2]);

      expect(result).toHaveLength(2);
      expect(result[0]!.externalId).toBe('rule-1');
      expect(result[1]!.externalId).toBe('rule-2');
    });

    it('should include type from the item type', () => {
      const ascentRule = buildAscentRule(withId('rule-123'));

      const result = transformRawObligationFromAscentItem([ascentRule]);

      expect(result[0]!.type).toBe('rule');
    });
  });

  describe('transformRuleToObligation', () => {
    it('should transform raw rule obligation to domain obligation', () => {
      const ruleId = 'rule-456';
      const regulatorId = 'reg-123';
      const ascentRule = buildAscentRule(
        withId(ruleId),
        withRegulatorId(regulatorId),
        withChapterId('chapter-789')
      );

      const rawObligation = buildRawExternalObligation(
        withExternalId(ruleId),
        withJson(JSON.stringify(ascentRule))
      );

      const result = transformRuleToObligation(rawObligation);

      expect(result).toEqual({
        contentHash: rawObligation.contentHash,
        description: ascentRule.attributes.content,
        effectiveDate: ascentRule.attributes.startsAt ?? undefined,
        expiryDate: ascentRule.attributes.endsAt ?? undefined,
        externalId: ascentRule.id,
        externalParentId: rawObligation.externalParentId,
        externalRegulatorId: regulatorId,
        provider: 'ascent',
        publishedDate: ascentRule.attributes.publishedDate,
        referenceCode: ascentRule.attributes.number,
        regulatorName: 'Prudential Regulation Authority Rulebook (PRA)',
        sequence: ascentRule.attributes.position,
        sourceUrl: ascentRule.attributes.links.app,
        tags: [],
        title: `${ascentRule.attributes.number}: ${ascentRule.attributes.title}`,
        type: 'rule',
      });
    });

    it('should use rule number as title when title is empty', () => {
      const ruleId = 'rule-456';
      const ascentRule = buildAscentRule(withId(ruleId));
      ascentRule.attributes.title = ''; // Empty title

      const rawObligation = buildRawExternalObligation(
        withExternalId(ruleId),
        withJson(JSON.stringify(ascentRule))
      );

      const result = transformRuleToObligation(rawObligation);

      expect(result.title).toBe(ascentRule.attributes.number);
    });

    it('should prepend reference code to title when title exists', () => {
      const ruleId = 'rule-456';
      const ascentRule = buildAscentRule(withId(ruleId));
      ascentRule.attributes.title = 'Test Rule Title';
      ascentRule.attributes.number = '3.Ins-AoR 3A.1';

      const rawObligation = buildRawExternalObligation(
        withExternalId(ruleId),
        withJson(JSON.stringify(ascentRule))
      );

      const result = transformRuleToObligation(rawObligation);

      expect(result.title).toBe('3.Ins-AoR 3A.1: Test Rule Title');
    });

    it('should use content hash from raw obligation', () => {
      const ruleId = 'rule-456';
      const ascentRule = buildAscentRule(withId(ruleId));

      const rawObligation = buildRawExternalObligation(
        withExternalId(ruleId),
        withJson(JSON.stringify(ascentRule))
      );

      const result = transformRuleToObligation(rawObligation);

      // The content hash should come from the raw obligation, not be recalculated
      expect(result.contentHash).toBe(rawObligation.contentHash);
    });
  });

  describe('transformTaskToObligation', () => {
    it('should transform raw task obligation to domain obligation', () => {
      const taskId = 'task-123';
      const regulatorId = 'reg-456';
      const ruleId = 'rule-789';
      const ascentTask = buildAscentTask(
        withTaskId(taskId),
        withTaskRegulatorId(regulatorId),
        withRuleId(ruleId)
      );

      const rawObligation = buildRawExternalObligation(
        withExternalId(taskId),
        withJson(JSON.stringify(ascentTask))
      );

      const result = transformTaskToObligation(rawObligation);

      expect(result).toEqual({
        contentHash: rawObligation.contentHash,
        description: ascentTask.attributes.content,
        effectiveDate: ascentTask.attributes.startsAt ?? undefined,
        expiryDate: ascentTask.attributes.endsAt ?? undefined,
        externalId: ascentTask.id,
        externalParentId: rawObligation.externalParentId,
        externalRegulatorId: regulatorId,
        provider: 'ascent',
        publishedDate: ascentTask.attributes.publishedDate,
        referenceCode: ascentTask.attributes.citation,
        regulatorName: 'Prudential Regulation Authority Rulebook (PRA)',
        sourceUrl: ascentTask.attributes.links.self,
        tags: ascentTask.attributes.tags,
        title: `${ascentTask.attributes.citation}: ${ascentTask.attributes.preview}`,
        type: 'task',
      });
    });

    it('should use citation alone as title when preview is empty', () => {
      const taskId = 'task-123';
      const ascentTask = buildAscentTask(withTaskId(taskId));
      ascentTask.attributes.preview = '';

      const rawObligation = buildRawExternalObligation(
        withExternalId(taskId),
        withJson(JSON.stringify(ascentTask))
      );

      const result = transformTaskToObligation(rawObligation);

      expect(result.title).toBe(ascentTask.attributes.citation);
    });

    it('should include tags from the task', () => {
      const taskId = 'task-123';
      const ascentTask = buildAscentTask(withTaskId(taskId));
      ascentTask.attributes.tags = ['tag-a', 'tag-b', 'tag-c'];

      const rawObligation = buildRawExternalObligation(
        withExternalId(taskId),
        withJson(JSON.stringify(ascentTask))
      );

      const result = transformTaskToObligation(rawObligation);

      expect(result.tags).toEqual(['tag-a', 'tag-b', 'tag-c']);
    });

    it('should use content hash from raw obligation', () => {
      const taskId = 'task-123';
      const ascentTask = buildAscentTask(withTaskId(taskId));

      const rawObligation = buildRawExternalObligation(
        withExternalId(taskId),
        withJson(JSON.stringify(ascentTask))
      );

      const result = transformTaskToObligation(rawObligation);

      expect(result.contentHash).toBe(rawObligation.contentHash);
    });
  });
});
