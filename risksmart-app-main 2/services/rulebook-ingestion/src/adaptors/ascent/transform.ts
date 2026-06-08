import type {
  NewRawExternalObligation,
  Obligation,
  Regulator,
  RegulatorId,
  UnlinkedObligation,
} from 'src/domain/types';
import {
  newRawExternalObligationSchema,
  regulatorSchema,
} from 'src/domain/types';
import type {
  NewRawExternalObligationChange,
  ObligationChange,
} from 'src/domain/types/obligation-change';
import {
  newRawExternalObligationChangeSchema,
  obligationChangeSchema,
} from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

import type { TypesafeTransform } from '../types';
import type {
  AscentHierarchicalEntity,
  AscentTask,
  AscentTaskVersion,
} from './types';
import {
  type AscentRegulator,
  type AscentRule,
  ascentRuleSchema,
  ascentTaskSchema,
  ascentTaskVersionSchema,
} from './types';

const logger = getLogger();

/**
 * Extracts the regulatorId from a task's JSON hierarchy.
 * For Ascent tasks, the regulator is at hierarchy[3].
 * https://risksmart-7443.ascentregtech.com/api/docs#api-v0-tasks
 */
const extractRegulatorFromTask = (task: AscentTask): Regulator => {
  const regulator = task.attributes.hierarchy[3];

  if (!regulator || regulator.type !== 'regulator') {
    logger.error('Regulator not found in task hierarchy', {
      externalTaskId: task.id,
      hierarchy: task.attributes.hierarchy,
    });
    throw new Error(
      `Regulator not found in task hierarchy for task ${task.id}`
    );
  }

  return regulatorSchema.parse(regulator);
};

const extractRegulatorFromRule = (rule: AscentRule): Regulator => {
  const regulator = rule.attributes.hierarchy[2];

  if (!regulator || regulator.type !== 'regulator') {
    logger.error('Regulator not found in rule hierarchy', {
      externalRuleId: rule.id,
      hierarchy: rule.attributes.hierarchy,
    });
    throw new Error(
      `Regulator not found in rule hierarchy for rule ${rule.id}`
    );
  }

  return regulatorSchema.parse(regulator);
};

const getParentFromHierarchy = (
  entity: AscentHierarchicalEntity
): { id: string; name: string } => {
  if (!entity.attributes.hierarchy[0]) {
    logger.error('Parent not found in rule hierarchy', {
      externalRuleId: entity.id,
      hierarchy: entity.attributes.hierarchy,
    });

    throw new Error('Parent not found in rule hierarchy');
  }

  return {
    id: entity.attributes.hierarchy[0].id,
    name: entity.attributes.hierarchy[0].name,
  };
};

export const transformRegulatorFromAscentApi = (
  regulatorData: AscentRegulator
): Regulator => {
  return regulatorSchema.parse({
    id: regulatorData.id,
    name: regulatorData.attributes.name,
  } satisfies TypesafeTransform<typeof regulatorSchema>);
};

export const transformRawObligationFromAscentItem = (
  items: AscentRule[] | AscentTask[]
): NewRawExternalObligation[] => {
  return items.map((item) => {
    let regulatorId: RegulatorId;

    if (item.type === 'rule') {
      regulatorId = extractRegulatorFromRule(item).id;
    } else {
      regulatorId = extractRegulatorFromTask(item).id;
    }

    return newRawExternalObligationSchema.parse({
      externalParentId: getParentFromHierarchy(item).id,
      externalId: item.id,
      json: JSON.stringify(item),
      type: item.type,
      regulatorId,
    } satisfies TypesafeTransform<typeof newRawExternalObligationSchema>);
  });
};

export const transformRawTaskVersionFromAscentItem = (
  items: AscentTaskVersion[]
): NewRawExternalObligationChange[] => {
  return items.map((item) => {
    return newRawExternalObligationChangeSchema.parse({
      externalParentId: String(item.attributes.taskId),
      externalId: item.id,
      json: JSON.stringify(item),
      type: 'obligation_change',
    } satisfies TypesafeTransform<typeof newRawExternalObligationChangeSchema>);
  });
};

export const transformRuleToObligation = (
  rule: NewRawExternalObligation
): Obligation | UnlinkedObligation => {
  const ascentRule = ascentRuleSchema.parse(JSON.parse(rule.json));

  const regulator = extractRegulatorFromRule(ascentRule);

  // title is required downstream and occasionally missing from Ascent data.
  // it is also frequently duplicated across rules, so we prepend the reference code.
  const title = ascentRule.attributes.title?.trim()
    ? `${ascentRule.attributes.number}: ${ascentRule.attributes.title}`
    : ascentRule.attributes.number;

  return {
    contentHash: rule.contentHash,
    description: ascentRule.attributes.content,
    effectiveDate: ascentRule.attributes.startsAt ?? undefined,
    expiryDate: ascentRule.attributes.endsAt ?? undefined,
    externalId: ascentRule.id,
    externalParentId: rule.externalParentId,
    externalRegulatorId: regulator.id,
    provider: 'ascent',
    publishedDate: ascentRule.attributes.publishedDate,
    referenceCode: ascentRule.attributes.number,
    regulatorName: regulator.name,
    sequence: ascentRule.attributes.position,
    sourceUrl: ascentRule.attributes.links.app,
    title,
    tags: [],
    type: 'rule',
  } satisfies Obligation;
};

export const transformTaskToObligation = (
  rule: NewRawExternalObligation
): Obligation | UnlinkedObligation => {
  const ascentTask = ascentTaskSchema.parse(JSON.parse(rule.json));

  const regulator = ascentTask.attributes.hierarchy[3];

  if (!regulator) {
    logger.error('Regulator not found in task hierarchy', {
      externalTaskId: ascentTask.id,
      hierarchy: ascentTask.attributes.hierarchy,
    });

    throw new Error('Regulator not found in task hierarchy');
  }

  const title = ascentTask.attributes.preview.trim()
    ? `${ascentTask.attributes.citation}: ${ascentTask.attributes.preview}`
    : ascentTask.attributes.citation;

  return {
    contentHash: rule.contentHash,
    description: ascentTask.attributes.content,
    effectiveDate: ascentTask.attributes.startsAt ?? undefined,
    expiryDate: ascentTask.attributes.endsAt ?? undefined,
    externalId: ascentTask.id,
    externalParentId: rule.externalParentId,
    externalRegulatorId: regulator.id,
    provider: 'ascent',
    publishedDate: ascentTask.attributes.publishedDate,
    referenceCode: ascentTask.attributes.citation,
    regulatorName: regulator.name,
    sourceUrl: ascentTask.attributes.links.self,
    tags: ascentTask.attributes.tags,
    title: title,
    type: 'task',
  } satisfies Obligation;
};

export const transformTaskVersionToObligationChange = (
  raw: NewRawExternalObligationChange,
  regulatorId: RegulatorId
): ObligationChange => {
  const ascentTaskVersion = ascentTaskVersionSchema.parse(JSON.parse(raw.json));

  const obligationChange = obligationChangeSchema.parse({
    externalId: ascentTaskVersion.id,
    externalParentId: String(ascentTaskVersion.attributes.taskId),
    contentHash: raw.contentHash,
    rationale: ascentTaskVersion.attributes.changeSummary ?? undefined,
    description: {
      before: ascentTaskVersion.attributes.diff.previous,
      after: ascentTaskVersion.attributes.diff.this,
    },
    effectiveDate: ascentTaskVersion.attributes.startsAt,
    sourceUrl: ascentTaskVersion.attributes.links.changeDetail,
    regulatorId,
  } satisfies ObligationChange);

  return obligationChange;
};
