import type { StackProps } from 'aws-cdk-lib';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  StreamViewType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export class GlobalTenantConfigStack extends Stack {
  private readonly PRIMARY_REGION = 'eu-west-2' as const;

  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps
  ) {
    super(scope, id, stackProps);

    this.createGlobalDynamoTable(props);
  }

  private createGlobalDynamoTable(props: LocalAppProps) {
    // this matches the pattern in cdk-stack.ts
    // If no region is specified, we assume it's the primary region
    // however this should always be specified in practice
    const region = !props.riskSmartRegionProps.awsRegion
      ? this.PRIMARY_REGION
      : props.riskSmartRegionProps.awsRegion;

    // Only make this table once, in London. It has cross-region replication to the other regions.
    if (region !== this.PRIMARY_REGION) {
      return;
    }

    const globalTable = new Table(
      this,
      `${props.stage}-risksmartApp-GlobalTenantConfig`,
      {
        tableName: `${props.stage}-risksmartApp-GlobalTenantConfig`,
        partitionKey: { name: 'pk', type: AttributeType.STRING },
        sortKey: { name: 'sk', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.RETAIN,
        replicationRegions: [
          'us-east-1',
          'eu-west-1',
          'me-central-1',
          'ca-central-1',
        ],
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
      }
    );

    // GSI1 - Overloaded GSI for all query patterns
    // Access patterns:
    //   - Tenants in region: GSI1PK = "REGION/<region>" (GSI1SK = tenantName)
    //   - Find tenant for org: GSI1PK = "<orgKey>" (GSI1SK = tenantName)
    //   - Orgs for tenant: Query base table (pk = tenant, filter entityType = "ORG")
    globalTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    return globalTable;
  }
}
