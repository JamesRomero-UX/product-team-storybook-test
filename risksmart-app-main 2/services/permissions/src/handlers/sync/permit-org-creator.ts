import type { Logger } from '@aws-lambda-powertools/logger';

type OrgRetriever = () => Promise<
  {
    OrgKey: string;
    Name: string;
  }[]
>;

type TenantCreator = (
  input: {
    key: string;
    name: string;
    description: string;
    attributes: Record<string, unknown>;
  }[]
) => Promise<void>;

interface Dependencies {
  orgRetriever: OrgRetriever;
  orgCreator: TenantCreator;
  tenantLogger: Logger;
  permitOrgMap: Map<string, unknown>;
  tenantOrgs: string[];
}

export const createOrgCreatorHandler = (dependencies: Dependencies) => {
  const syncExecutor = async () => {
    return await executeOrgCreation(dependencies);
  };

  return {
    executeOrgCreation: syncExecutor,
  };
};

export const executeOrgCreation = async (input: Dependencies) => {
  const {
    orgRetriever,
    orgCreator: tenantCreator,
    tenantLogger,
    permitOrgMap,
    tenantOrgs,
  } = input;
  if (tenantOrgs.length === 0) {
    tenantLogger.info('No orgs to create in Permit');

    return {
      createdOrgs: [],
    };
  }

  tenantLogger.info('Filtering orgs to process', { orgKeys: tenantOrgs });

  const allOrgsInDb = await orgRetriever();
  tenantLogger.info('Got orgs from DB', {
    orgCount: allOrgsInDb.length,
  });

  const orgs = allOrgsInDb.filter((org) => tenantOrgs.includes(org.OrgKey));
  tenantLogger.info('Filtered orgs to process', {
    orgCount: orgs.length,
  });

  const orgsToCreate = orgs.filter((org) => !permitOrgMap.has(org.OrgKey));
  if (orgsToCreate.length === 0) {
    tenantLogger.info('No orgs to create in Permit');

    return {
      createdOrgs: [],
    };
  }

  tenantLogger.info('Bulk creating orgs', {
    orgCount: orgsToCreate.length,
  });
  await tenantCreator(
    orgsToCreate.map((org) => ({
      key: org.OrgKey,
      name: org.Name,
      description: org.Name,
      attributes: {},
    }))
  );

  return {
    createdOrgs: orgsToCreate,
  };
};
