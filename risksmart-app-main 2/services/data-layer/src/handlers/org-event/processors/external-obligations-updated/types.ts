import {
  type NewObligation,
  type ObligationId,
} from '@risksmart-app/domain/src/types/obligation';
export type NewIngestedObligation = Omit<
  NewObligation,
  | 'orgKey'
  | 'createdByUser'
  | 'modifiedByUser'
  | 'adherence'
  | 'regulatorySourceId'
  | 'parentId'
> & {
  externalId: string;
  regulatorySourceId: string;
  contentHash: string;
  sourceUrl?: string | null;
};

export interface IngestedRegulatorySource {
  id: string;
  name: string;
  providerName: string;
}

export interface NewIngestedObligationChange {
  externalId: string;
  externalParentId: string;
  description: { before: string; after: string };
  rationale?: string;
  effectiveDate?: string;
  sourceUrl?: string;
  contentHash: string;
  regulatorySourceId: string;
}

export interface ObligationChangeset {
  regulatorySource: IngestedRegulatorySource;
  obligations: {
    added: NewIngestedObligation[];
    updated: NewIngestedObligation[];
  };
  obligationChanges: {
    added: NewIngestedObligationChange[];
    updated: NewIngestedObligationChange[];
  };
}

export interface ObligationLookup {
  obligationId: ObligationId;
  parentId: ObligationId | null;
}

export type ParentIdMap = Map<string, ObligationLookup>;
