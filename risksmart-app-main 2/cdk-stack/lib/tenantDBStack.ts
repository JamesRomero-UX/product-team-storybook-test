import type { StackProps } from 'aws-cdk-lib';
import { Duration, RemovalPolicy, SecretValue, Stack, Tags } from 'aws-cdk-lib';
import type { IConnectable, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Port, Protocol, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { IKey } from 'aws-cdk-lib/aws-kms';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type {
  DatabaseClusterFromSnapshotProps,
  DatabaseClusterProps,
  DatabaseProxy,
  IClusterInstance,
  IDatabaseCluster,
} from 'aws-cdk-lib/aws-rds';
import {
  AuroraPostgresEngineVersion,
  CfnDBProxyEndpoint,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
  DatabaseClusterFromSnapshot,
  DatabaseInsightsMode,
  InstanceUpdateBehaviour,
  ParameterGroup,
  PerformanceInsightRetention,
  SnapshotCredentials,
} from 'aws-cdk-lib/aws-rds';
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import type { EnvSettings, TenantSettings } from './env';
import { getEnvSettings } from './env';

interface DBStackProps {
  vpc: IVpc;
  trpcDataSg: SecurityGroup;
  dataLayerSg: SecurityGroup;
  vpnSecurityGroup?: SecurityGroup;
}

/**
 * Database resources
 */
export class TenantDBStack extends Stack {
  private envSettings: EnvSettings;

  kmsKey: IKey;
  databaseCluster: IDatabaseCluster;
  private databaseSecret: ISecret;
  private reportingDatabaseSecret: ISecret;
  private reportingConnectionSecret: ISecret;
  connectionSecret: ISecret;
  private databaseProxy: DatabaseProxy | null = null;
  private databaseProxyReadOnlyEndpoint: CfnDBProxyEndpoint | null = null;
  private postgresVersion: AuroraPostgresEngineVersion;
  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps,
    private tenant: TenantSettings,
    private dbStackProps: DBStackProps
  ) {
    super(scope, id, stackProps);
    this.envSettings = getEnvSettings(props.stage);

    const {
      reportingDatabaseSecret,
      databaseSecret,
      kmsKey,
      dataLayerDatabaseSecret,
    } = this.createSecrets(props);
    this.kmsKey = kmsKey;
    this.reportingDatabaseSecret = reportingDatabaseSecret;
    this.postgresVersion = AuroraPostgresEngineVersion.VER_16_8;
    this.databaseSecret = databaseSecret;
    this.databaseCluster = this.createDBClusters(props);
    if (this.tenant.databaseEnableProxy) {
      const { databaseProxy, databaseProxyReadOnlyEndpoint } =
        this.createDatabaseProxy(props, dataLayerDatabaseSecret);
      this.databaseProxy = databaseProxy;
      this.databaseProxyReadOnlyEndpoint = databaseProxyReadOnlyEndpoint;
    }
    this.setupSecurityGroups(props);
    const { connectionSecret, reportingConnectionSecret } =
      this.createDatabaseSecrets(props, dataLayerDatabaseSecret);
    this.connectionSecret = connectionSecret;
    this.reportingConnectionSecret = reportingConnectionSecret;

    Tags.of(this).add('customers', this.tenant.customers.join('/'));
  }
  private createSecrets(props: LocalAppProps) {
    const username =
      this.tenant.databaseMasterUsernameOverride ?? this.tenant.name;
    const databaseSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-DBCredentialsSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props?.stage}-${props.appName}-${this.tenant.name}-credentials`,
        description: `Hasura RDS credentials for ${this.tenant.name}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username,
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );
    const reportingDatabaseSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-ReportingDBCredentialsSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props?.stage}-${props.appName}-${this.tenant.name}-reporting-credentials`,
        description: `Reporting RDS credentials for ${this.tenant.name}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'reporting',
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );
    const kmsKey = new Key(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-KMSKey`,
      {
        description: `KMS Key for tenant ${this.tenant.name}`,
        enableKeyRotation: true,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );

    const dataLayerDatabaseSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-DataLayerDBCredentialsSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props?.stage}-${props.appName}-${this.tenant.name}-data-layer-credentials`,
        description: `Data Layer RDS credentials for ${this.tenant.name}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'data_layer',
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );

    // Grant DR account backup service role access to decrypt for cross-account backup copies
    if (props.stage === 'app') {
      kmsKey.addToResourcePolicy(
        new PolicyStatement({
          sid: 'AllowDRAccountBackupDecrypt',
          effect: Effect.ALLOW,
          principals: [
            new ArnPrincipal(
              'arn:aws:iam::134258997950:role/aws-service-role/backup.amazonaws.com/AWSServiceRoleForBackup'
            ),
          ],
          actions: ['kms:Decrypt', 'kms:DescribeKey', 'kms:CreateGrant'],
          resources: ['*'], // Required for KMS key resource policies - '*' means "this key"
          conditions: {
            Bool: { 'kms:GrantIsForAWSResource': 'true' },
            StringEquals: {
              'kms:CallerAccount': '134258997950', // Restrict to DR account only
            },
          },
        })
      );
    }

    const alias = kmsKey.addAlias(
      `${props.stage}-${props.appName}-${this.tenant.name}-KMSKey`
    );

    return {
      kmsKey,
      alias,
      databaseSecret,
      reportingDatabaseSecret,
      dataLayerDatabaseSecret,
    };
  }
  private createDBClusters(props: LocalAppProps) {
    const clusterParameterGroup = new ParameterGroup(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-DBParameterGroup`,
      {
        name: `${props.stage}-${props.appName}-${this.tenant.name}-DBParameterGroup`,
        engine: DatabaseClusterEngine.auroraPostgres({
          version: this.postgresVersion,
        }),
        parameters: {
          password_encryption: 'scram-sha-256',
          // If we don't wish to support md5, uncomment the line below
          // 'rds.accepted_password_auth_method': 'scram',
        },
      }
    );
    const dbProps: DatabaseClusterProps = {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: this.postgresVersion,
      }),
      writer: ClusterInstance.serverlessV2('writer', {
        performanceInsightRetention: this.tenant.enableAdvancedDatabaseInsights
          ? PerformanceInsightRetention.MONTHS_15
          : undefined,
      }),
      readers: getReaders(this.tenant),

      instanceUpdateBehaviour: InstanceUpdateBehaviour.ROLLING,
      iamAuthentication: true,
      vpc: this.dbStackProps.vpc,
      vpcSubnets: {
        subnets: this.dbStackProps.vpc.isolatedSubnets,
      },
      credentials: Credentials.fromSecret(this.databaseSecret),
      backup: {
        retention: Duration.days(this.tenant.backupRetentionDays),
      },
      enableDataApi: false,
      clusterIdentifier:
        `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-DatabaseCluster`.toLowerCase(),
      serverlessV2MaxCapacity: this.tenant.maxDbCapacity,
      serverlessV2MinCapacity: this.tenant.minDbCapacity,
      parameterGroup: clusterParameterGroup,
      storageEncryptionKey: this.kmsKey,
      cloudwatchLogsExports: ['postgresql'],
      databaseInsightsMode: this.tenant.enableAdvancedDatabaseInsights
        ? DatabaseInsightsMode.ADVANCED
        : undefined,
      performanceInsightRetention: this.tenant.enableAdvancedDatabaseInsights
        ? PerformanceInsightRetention.MONTHS_15
        : undefined,
      cloudwatchLogsRetention: RetentionDays.ONE_MONTH,
      deletionProtection: this.envSettings.databaseDeletionProtection,
      removalPolicy: this.envSettings.databaseRemovalPolicy,
    };
    if (this.tenant.snapshotId !== undefined && this.tenant.dbMigration) {
      const { credentials: _credentials, ...dbPropsWithoutCredentials } =
        dbProps;
      const snapShotProps: DatabaseClusterFromSnapshotProps = {
        ...dbPropsWithoutCredentials,
        snapshotIdentifier: this.tenant.snapshotId || '',
        snapshotCredentials: SnapshotCredentials.fromSecret(
          this.databaseSecret
        ),
      };
      this.databaseCluster = new DatabaseClusterFromSnapshot(
        this,
        `${props.stage}-${props.appName}-${this.tenant.name}-DBAuroraCluster`,
        snapShotProps
      );
    } else {
      this.databaseCluster = new DatabaseCluster(
        this,
        `${props.stage}-${props.appName}-${this.tenant.name}-DBAuroraCluster`,
        dbProps
      );
    }

    return this.databaseCluster;
  }
  private createDatabaseProxy(
    props: LocalAppProps,
    dataLayerDatabaseSecret: ISecret
  ) {
    const databaseProxy = this.databaseCluster.addProxy(
      `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-DBCluster-Proxy`,
      {
        secrets: [
          this.databaseSecret,
          this.reportingDatabaseSecret,
          dataLayerDatabaseSecret,
        ],
        vpc: this.dbStackProps.vpc,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        securityGroups: this.databaseCluster.connections.securityGroups,
        maxConnectionsPercent: 80,
        requireTLS: true,
        idleClientTimeout: Duration.seconds(1800),
      }
    );
    let databaseProxyReadOnlyEndpoint: CfnDBProxyEndpoint | null = null;
    if (this.tenant.databaseReaderInstanceCount > 0) {
      databaseProxyReadOnlyEndpoint = new CfnDBProxyEndpoint(
        this,
        'RdsProxyReadOnlyEndPoint',
        {
          vpcSubnetIds: this.dbStackProps.vpc.isolatedSubnets.map(
            (s) => s.subnetId
          ),
          vpcSecurityGroupIds:
            this.databaseCluster.connections.securityGroups.map(
              (s) => s.securityGroupId
            ),
          dbProxyEndpointName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-RdsProxyReadOnlyEndpoint`,
          dbProxyName: databaseProxy.dbProxyName,
          targetRole: 'READ_ONLY',
        }
      );
    }

    return { databaseProxy, databaseProxyReadOnlyEndpoint };
  }
  private createDatabaseSecrets(
    props: LocalAppProps,
    dataLayerDatabaseSecret: ISecret
  ) {
    const username =
      this.tenant.databaseMasterUsernameOverride ?? this.tenant.name;
    // postgres connection string
    const connectionString = `postgres://${username}:${this.databaseSecret
      .secretValueFromJson('password')
      .unsafeUnwrap()}@${this.tenant.databaseEnableProxy ? this.databaseProxy?.endpoint : this.databaseCluster.clusterEndpoint.hostname}:${
      this.databaseCluster.clusterEndpoint.port
    }/postgres?sslmode=require`;
    // save connection string as a secret
    const connectionSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-ConnectionSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-ConnectionSecret`,
        secretStringValue: SecretValue.unsafePlainText(connectionString),
        description: 'Hasura RDS connection string',
      }
    );
    let reportingHost: string | undefined =
      this.databaseCluster.clusterEndpoint.hostname;
    if (this.tenant.databaseEnableProxy) {
      reportingHost = this.databaseProxy?.endpoint;
      if (this.tenant.databaseReaderInstanceCount > 0) {
        reportingHost = this.databaseProxyReadOnlyEndpoint?.attrEndpoint;
      }
    }
    const reportingConnectionString = `postgres://reporting:${this.reportingDatabaseSecret
      .secretValueFromJson('password')
      .unsafeUnwrap()}@${reportingHost}:${
      this.databaseCluster?.clusterEndpoint.port
    }/postgres?sslmode=require`;
    // save connection string as a secret
    const reportingConnectionSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-ReportingConnectionSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-ReportingConnectionSecret`,
        secretStringValue: SecretValue.unsafePlainText(
          reportingConnectionString
        ),
        description: 'Reporting RDS connection string',
      }
    );

    const dataLayerConnectionString = `postgres://data_layer:${dataLayerDatabaseSecret
      .secretValueFromJson('password')
      .unsafeUnwrap()}@${reportingHost}:${
      this.databaseCluster?.clusterEndpoint.port
    }/postgres?sslmode=verify-full`;
    const dataLayerConnectionSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${this.tenant.name}-DataLayerConnectionSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-DataLayerConnectionSecret`,
        secretStringValue: SecretValue.unsafePlainText(
          dataLayerConnectionString
        ),
        description: 'Data Layer RDS connection string',
      }
    );

    return {
      reportingConnectionSecret,
      connectionSecret,
      dataLayerConnectionSecret,
    };
  }

  private setupSecurityGroups(props: LocalAppProps) {
    const reportDataSgName = `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${this.tenant.name}-ReportDataSg`;

    const reportDataSg = new SecurityGroup(this, reportDataSgName, {
      securityGroupName: reportDataSgName,
      vpc: this.dbStackProps.vpc,
    });

    const itemsRequiringDbAccess: IConnectable[] = [
      reportDataSg,
      this.dbStackProps.trpcDataSg,
      this.dbStackProps.dataLayerSg,
    ];

    if (this.dbStackProps.vpnSecurityGroup) {
      itemsRequiringDbAccess.push(this.dbStackProps.vpnSecurityGroup);
    }

    itemsRequiringDbAccess.forEach((other) => {
      this.databaseCluster?.connections.allowFrom(
        other,
        new Port({
          protocol: Protocol.TCP,
          stringRepresentation: 'Postgres Port',
          fromPort: 5432,
          toPort: 5432,
        })
      );
      // Note: this could become an if/else statement with the above, but allowing access to both cluster and proxy initially
      // to ensure everything is working as expected
      if (this.tenant.databaseEnableProxy) {
        if (!this.databaseProxy) {
          throw new Error('Missing database proxy');
        }
        this.databaseProxy.connections.allowFrom(
          other,
          new Port({
            protocol: Protocol.TCP,
            stringRepresentation: 'Postgres Port',
            fromPort: 5432,
            toPort: 5432,
          })
        );
      }
    });
  }
}

function getReaders(tenant: TenantSettings): IClusterInstance[] | undefined {
  const readers: IClusterInstance[] = [];
  if (
    tenant.databaseReaderInstanceCount &&
    tenant.databaseReaderInstanceCount > 0
  ) {
    for (let i = 0; i < tenant.databaseReaderInstanceCount; i++) {
      readers[i] = ClusterInstance.serverlessV2(`reader-${i}`, {
        performanceInsightRetention: tenant.enableAdvancedDatabaseInsights
          ? PerformanceInsightRetention.MONTHS_15
          : undefined,
      });
    }

    return readers;
  }

  return undefined;
}
