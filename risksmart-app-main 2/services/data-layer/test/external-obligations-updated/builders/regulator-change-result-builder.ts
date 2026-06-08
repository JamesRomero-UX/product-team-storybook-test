import { createHash } from 'node:crypto';

import type { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  ingestionServiceObligationChangeSchema,
  ingestionServiceObligationSchema,
  type ingestionServiceObligationTypeSchema,
  type RegulatorChangeResult,
} from '../../../src/adaptors/s3-obligation-provider/types';

type Obligation = z.infer<typeof ingestionServiceObligationSchema>;
type ObligationChange = z.infer<typeof ingestionServiceObligationChangeSchema>;

type BuilderState = RegulatorChangeResult & { regulatorName: string };

type RegulatorChangeResultBuilder = (item: BuilderState) => BuilderState;

type ObligationInput = Partial<
  Omit<
    Obligation,
    | 'type'
    | 'externalParentId'
    | 'externalRegulatorId'
    | 'provider'
    | 'regulatorName'
    | 'contentHash'
    | 'externalId'
    | 'title'
  >
> & {
  externalId: string;
  title: string;
};

interface ObligationNode {
  input: ObligationInput;
  type: z.infer<typeof ingestionServiceObligationTypeSchema>;
  children: ObligationNode[];
}

export const standard = (
  input: ObligationInput,
  children: ObligationNode[] = []
): ObligationNode => ({
  input,
  type: 'standard',
  children,
});

export const chapter = (
  input: ObligationInput,
  children: ObligationNode[] = []
): ObligationNode => ({
  input,
  type: 'chapter',
  children,
});

export const rule = (
  input: ObligationInput,
  children: ObligationNode[] = []
): ObligationNode => ({
  input,
  type: 'rule',
  children,
});

export const task = (input: ObligationInput): ObligationNode => ({
  input,
  type: 'task',
  children: [],
});

const flattenNodes = (
  nodes: ObligationNode[],
  regulatorId: string,
  regulatorName: string,
  parentId?: string
): Obligation[] => {
  return nodes.flatMap((node) => {
    const { externalId, title, ...rest } = node.input;
    const obligation: Obligation = ingestionServiceObligationSchema.parse({
      contentHash: createHash('sha256')
        .update(`${title}${rest.description ?? ''}`)
        .digest('hex'),
      externalId,
      externalParentId: parentId ?? null,
      externalRegulatorId: regulatorId,
      provider: 'Test Provider',
      regulatorName,
      title,
      type: node.type,
      ...rest,
    });

    return [
      obligation,
      ...flattenNodes(node.children, regulatorId, regulatorName, externalId),
    ];
  });
};

export const withRegulatorId =
  (id: string): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    regulatorId: id,
  });

export const withRegulatorName =
  (name: string): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    regulatorName: name,
  });

export const withAdded =
  (...nodes: ObligationNode[]): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    obligations: {
      ...item.obligations,
      added: [
        ...item.obligations.added,
        ...flattenNodes(nodes, item.regulatorId, item.regulatorName),
      ],
    },
  });

export const withUpdated =
  (...nodes: ObligationNode[]): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    obligations: {
      ...item.obligations,
      updated: [
        ...item.obligations.updated,
        ...flattenNodes(nodes, item.regulatorId, item.regulatorName),
      ],
    },
  });

type ObligationChangeInput = Omit<ObligationChange, 'regulatorId'>;

export const obligationChange = (
  input: ObligationChangeInput
): ObligationChangeInput => input;

export const withObligationChangesAdded =
  (...changes: ObligationChangeInput[]): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    obligationChanges: {
      ...item.obligationChanges,
      added: [
        ...item.obligationChanges.added,
        ...changes.map((c) =>
          ingestionServiceObligationChangeSchema.parse({
            ...c,
            regulatorId: item.regulatorId,
          })
        ),
      ],
    },
  });

export const withObligationChangesUpdated =
  (...changes: ObligationChangeInput[]): RegulatorChangeResultBuilder =>
  (item) => ({
    ...item,
    obligationChanges: {
      ...item.obligationChanges,
      updated: [
        ...item.obligationChanges.updated,
        ...changes.map((c) =>
          ingestionServiceObligationChangeSchema.parse({
            ...c,
            regulatorId: item.regulatorId,
          })
        ),
      ],
    },
  });

const getDefaultValue = (): BuilderState => ({
  previousRunId: null,
  regulatorId: 'regulator-1',
  regulatorName: 'Test Regulator',
  providerName: 'Test Provider',
  obligations: {
    added: [],
    updated: [],
    removed: [],
  },
  obligationChanges: {
    added: [],
    updated: [],
    removed: [],
  },
});

export const createRegulatorChangeResult = (
  ...builders: RegulatorChangeResultBuilder[]
): RegulatorChangeResult => {
  const { regulatorName: _, ...item } = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};
