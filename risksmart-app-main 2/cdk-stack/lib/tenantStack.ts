import type { StackProps } from 'aws-cdk-lib';
import {
  aws_wafv2 as wafv2,
  Duration,
  RemovalPolicy,
  SecretValue,
  Stack,
} from 'aws-cdk-lib';
import {
  BackupPlan,
  BackupPlanRule,
  BackupResource,
  BackupVault,
} from 'aws-cdk-lib/aws-backup';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { type Table, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import type {
  ClientVpnEndpointOptions,
  IInterfaceVpcEndpoint,
} from 'aws-cdk-lib/aws-ec2';
import {
  ClientVpnUserBasedAuthentication,
  FlowLog,
  FlowLogDestination,
  FlowLogResourceType,
  FlowLogTrafficType,
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpointAwsService,
  IpAddresses,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import type { Platform as _Platform } from 'aws-cdk-lib/aws-ecr-assets';
import type { Cluster, ContainerDefinitionOptions } from 'aws-cdk-lib/aws-ecs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import {
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
  Protocol,
} from 'aws-cdk-lib/aws-ecs';
import type { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  ApplicationListenerRule,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  IpAddressType,
  ListenerAction,
  ListenerCondition,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import type { EventBus } from 'aws-cdk-lib/aws-events';
import {
  AccessKey,
  Effect,
  ManagedPolicy,
  Policy,
  PolicyStatement,
  Role,
  SamlMetadataDocument,
  SamlProvider,
  ServicePrincipal,
  User,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, LogStream, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type {
  CfnDBProxyEndpoint,
  DatabaseClusterFromSnapshotProps,
  DatabaseClusterProps,
  DatabaseProxy,
} from 'aws-cdk-lib/aws-rds';
import {
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
  InstanceUpdateBehaviour,
} from 'aws-cdk-lib/aws-rds';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';
import {
  ARecord,
  HostedZone,
  RecordTarget,
  ZoneDelegationRecord,
} from 'aws-cdk-lib/aws-route53';
import {
  CloudFrontTarget,
  LoadBalancerTarget,
} from 'aws-cdk-lib/aws-route53-targets';
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { NamespaceType } from 'aws-cdk-lib/aws-servicediscovery';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import type { Construct } from 'constructs';
import path from 'path';

import {
  getGlobalTenantConfigTableArn,
  type LocalAppProps,
} from '../bin/cdk-stack';
import type { DatadogConfig } from './datadog';
import {
  addDatadogAgent,
  addFireLensLogging,
  getDatadogEnvVars,
} from './datadog';
import type { EnvSettings, TenantSettings } from './env';
import { getEnvSettings } from './env';

export interface TenantStackProps {
  jwtSecret: string;
  hasuraEnableConsole: string;
  hasuraLogLevel: string;
  hasuraAdminSecret: ISecret;
  hasuraPgConnections: number;
  cloudfrontHostedZone: IHostedZone;
  cloudfrontCertificate: Certificate;
  cloudfrontHostName: string;
  integrationHostedZone: IHostedZone;
  integrationCertificate: Certificate;
  integrationHostName: string;
  restApiDomain: string;
  enableVpn?: boolean;
  commonEventBus: EventBus;
}

export interface Tenant extends TenantSettings {
  /**
   * Secret to connect to the database (via rds proxy if enabled)
   * Used by hasura
   * Read and write
   */
  connectionSecret?: ISecret;
  alb?: ApplicationLoadBalancer;
  kmsKey?: Key;

  /**
   * Secret containing db credentials.
   */
  databaseSecret?: Secret;
  /**
   * Secret to connect to the database via rds proxy
   * Use for reporting (read only)
   */
  reportingDatabaseSecret?: Secret;
  /**
   * Secret containing the full rds connection string for the reporting user.
   * Will point to the rds proxy
   */
  reportingConnectionSecret?: ISecret;
  databaseCluster?: DatabaseCluster;

  databaseProxy?: DatabaseProxy;
  databaseProxyReadOnlyEndpoint?: CfnDBProxyEndpoint;

  proxyRole?: Role;
}

export type { DatadogConfig } from './datadog';

export interface n8nIntegration {
  encryptionString?: Secret;
  albPriority: number | undefined;
  databaseCluster?: DatabaseCluster;
  maxDbCapacity: number | undefined;
  minDbCapacity: number | undefined;
  backupRetentionDays: number;
  taskDefinition?: FargateTaskDefinition;
  kmsKey?: Key;
  databaseSecret?: ISecret;
  database: string;
  databaseHost?: string;
  databasePort?: number;
  databaseUser: string;
  dbType: string;
  n8nVersion: string;
  containerPort: number;
  name: string;
  iamUser: string;
  iamUserSecret?: ISecret;
}

const integrationPlatform: n8nIntegration = {
  name: 'n8n-int',
  n8nVersion: '1.123.23',
  containerPort: 8085,
  dbType: 'postgresdb',
  database: 'n8n',
  maxDbCapacity: 4,
  minDbCapacity: 0.5,
  backupRetentionDays: 30,
  albPriority: 9999,
  databaseUser: 'n8nUser',
  iamUser: 'n8nUser',
};

export interface PermitConfig extends DatadogConfig {
  taskDefinition?: FargateTaskDefinition;
  permitSecret?: ISecret;
  containerPort: number;
  name: string;
  imageTag: string;
}

export interface TRPCConfig extends DatadogConfig {
  albPriority: number | undefined;
  taskDefinition?: FargateTaskDefinition;
  trpcContainerBuild: string;
  sentryDsn: string;
  containerPort: number;
  name: string;
  auth0Domain: string;
  auth0ManagementClientId: string;
  auth0RiskSmartRestApiClientId: string;
  auth0ClientId: string;
}

export interface MCPConfig extends DatadogConfig {
  albPriority: number | undefined;
  taskDefinition?: FargateTaskDefinition;
  mcpContainerBuild: string;
  containerPort: number;
  name: string;
  auth0Domain: string;
  auth0ApiAudience: string;
}

const permitConfigBase = {
  name: 'permit',
  containerPort: 7000,
  imageTag: '0.9.9',
} as const;

export interface ExternalAPIConfig extends DatadogConfig {
  hasuraDomain: string;
  appDomain: string;
  albPriority: number | undefined;
  taskDefinition?: FargateTaskDefinition;
  extAPIContainerBuild: string;
  containerPort: number;
  clientTableArn: string;
  rateLimitTableArn: string;
  rateLimitTableName: string;
  userPoolId: string;
  authProviderConfig: string;
  name: string;
  authJwtProviders: { alg: string; jwkUri: string; issuer: string }[];
}

//function to return tenants for a given stage, using the tenants array and noProd
const getTenants = (stage: string, props: LocalAppProps): Tenant[] => {
  const envSettings = getEnvSettings(props.stage);
  const filteredTenants = envSettings.tenants.filter(
    (tenant) => tenant.region === props.riskSmartRegionProps.awsRegion
  );

  return filteredTenants;
};

export class TenantStack extends Stack {
  defaultVPC: Vpc;
  defaultALB: ApplicationLoadBalancer;
  defaultALBHostname: string;
  defaultALBCertificate: Certificate;
  defaultHostedZone: IHostedZone;
  defaultALBSecurityGroup: SecurityGroup;
  clientVpnSecurityGroup?: SecurityGroup;
  ecsCluster: Cluster;
  defaultWAF: wafv2.CfnWebACL;
  envSettings: EnvSettings;
  tenants: Tenant[];
  hasuraEcsSG: SecurityGroup;
  hasuraHttpsListener: ApplicationListener;
  trpcDataSg: SecurityGroup;
  dynamoTable?: Table;
  permitSecretName: string;
  dataLayerSg: SecurityGroup;
  apiGatewayVpcEndpoint: IInterfaceVpcEndpoint;

  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps,
    tenantStackProps: TenantStackProps,
    serviceConfigs: {
      trpc: TRPCConfig;
      extAPI: ExternalAPIConfig;
      mcp: MCPConfig;
    }
  ) {
    super(scope, id, stackProps);
    this.tenants = getTenants(props.stage, props);
    this.envSettings = getEnvSettings(props.stage);

    const {
      trpc: trpcConfig,
      extAPI: extAPIConfig,
      mcp: mcpConfig,
    } = serviceConfigs;

    //For both tenants and integrations
    const { defaultALBHostname, defaultHostedZone } = this.createDomain(props);
    this.defaultALBHostname = defaultALBHostname;
    this.defaultHostedZone = defaultHostedZone;

    //For both tenants and integrations
    this.defaultALBCertificate = this.createCertificates(props);

    //For both tenants and integrations
    this.defaultVPC = this.createVPC(props);
    this.defaultVPC.isolatedSubnets.forEach((subset) => {
      this.exportValue(subset.subnetId);
    });

    //For integrations
    this.createIntegrationSecrets(props, integrationPlatform);

    //For integrations
    this.createIntegrationDBClusters(props, integrationPlatform);

    //For integrations
    this.createIntegrationsBackupPlan(props, integrationPlatform);

    //For integrations
    this.createTaskDefinitionIntegration(
      props,
      integrationPlatform,
      tenantStackProps
    );

    //For Permit
    const permitConfig: PermitConfig = {
      ...permitConfigBase,
      datadogPublicKey: trpcConfig.datadogPublicKey,
    };
    this.createPermitSecrets(props, permitConfig);

    //For Permit
    this.createTaskDefinitionPermit(props, permitConfig);

    //For TRPC
    this.createTaskDefinitionTrpc(
      props,
      trpcConfig,
      permitConfig,
      tenantStackProps
    );

    //For External API
    this.createTaskDefinitionExtAPI(
      props,
      extAPIConfig,
      trpcConfig,
      tenantStackProps
    );

    //For MCP Server
    this.createTaskDefinitionMcp(props, mcpConfig, tenantStackProps);

    // For both tenants and integrations
    this.ecsCluster = this.createECSCluster(props);

    //TODO : Add Rule for n8n in console and add here
    this.defaultWAF = this.createWAF(props);

    // For both tenants and integrations
    const { alb, albSg } = this.createALB(props, tenantStackProps);
    this.defaultALB = alb;
    this.defaultALBSecurityGroup = albSg;

    //For tenants
    const { hasuraEcsSG, hasuraHttpsListener, trpcDataSg } =
      this.createHasuraListener(props);
    this.trpcDataSg = trpcDataSg;
    this.exportValue(trpcDataSg.securityGroupId);

    this.hasuraEcsSG = hasuraEcsSG;
    this.hasuraHttpsListener = hasuraHttpsListener;

    this.dataLayerSg = this.createDataLayerSecurityGroup(props);

    //For integrations
    this.createIntegrationFargateServices(
      props,
      integrationPlatform,
      tenantStackProps
    );

    // //For permit
    const permitService = this.createPermitFargateServices(
      props,
      permitConfig,
      trpcDataSg
    );

    // //For trpc
    const { trpcService } = this.createTrpcFargateServices(
      props,
      trpcConfig,
      trpcDataSg
    );

    trpcService.node.addDependency(permitService);

    // For External API
    this.createExtAPIFargateServices(
      props,
      extAPIConfig,
      trpcDataSg,
      trpcConfig
    );

    // For MCP Server
    this.createMcpFargateServices(props, mcpConfig);

    //For tenants
    this.createCloudfrontDeployFunction(props, tenantStackProps);

    this.createIntegrationAwsUser(props, integrationPlatform);

    if (tenantStackProps.enableVpn) {
      this.createVpn(props, tenantStackProps);
    }
  }

  // Create a NGINX task definition for the ALB
  private createCloudfrontDeployFunction(
    props: LocalAppProps,
    tenantStackProps: TenantStackProps
  ) {
    // Add a cloudfront Function to a Distribution
    const cfFunction = new cloudfront.Function(
      this,
      `${props.stage}-${props.appName}-cloudfront-functionV2`,
      {
        code: cloudfront.FunctionCode.fromInline(`function handler(event) {
          var allowedIps = [
              '209.42.5.194'  // RiskSmart VPN

            , '18.134.31.59'  // AWS prod eu-west-2
            , '52.56.35.166'  // AWS prod eu-west-2


            , '3.10.97.203'   // AWS staging eu-west-2
            , '16.52.117.55'  // AWS staging ca-central-1
            , '40.172.242.55' // AWS staging me-central-1
            , '54.234.249.217'// AWS staging us-east-1

            , '35.177.40.229' // AWS tech-admin eu-west-2

            , '13.42.72.7'    // AWS dev eu-west-2
            , '40.172.178.7'  // AWS dev me-central-1
            , '3.233.85.15'   // AWS dev us-east-1
            , '3.96.120.163'  // AWS dev ca-central-1
          ];

          // If the request contains an admin secret, only allow if from an allowed IP
          // if (event.request.headers['x-hasura-admin-secret']) {
          //     var request = event.viewer && event.viewer.ip ? event.viewer.ip : null;
          //     if (!request) {
          //         return {
          //             statusCode: 400,
          //             statusDescription: 'Bad Request',
          //             body: '<h1>Bad Request</h1><p>'+ JSON.stringify(event) +'</p>',
          //         };
          //     }
          //     var clientIP = request.clientIp;
          //     var isAllowed = allowedIps.includes(clientIP);
          //     if (!isAllowed) {
          //         var response = {
          //             statusCode: 403,
          //             statusDescription: 'Forbidden',
          //             headers: {
          //                 'content-type': [{ key: 'Content-Type', value: 'text/html' }],
          //             },
          //             body: '<h1>Access denied.</h1><p>Sorry! You are not authorized to access this page. Please contact the site administrator.</p>',
          //         };
          //         return response;
          //     }
          // }

          if (!event.request.headers['x-tenant-name']) {
              var pathParts = event.request.uri.split('/');
              if (pathParts.length >= 3) {
                  event.request.headers['x-tenant-name'] = { value: pathParts[1].toLowerCase() };
                  event.request.uri = event.request.uri.slice(event.request.uri.indexOf("/", 1));
              }
          }

          if (!event.request.headers['x-hasura-tenant-name'] && event.request.headers['x-tenant-name']) {
              event.request.headers['x-hasura-tenant-name'] = { value: event.request.headers['x-tenant-name'].value };
          }

          return event.request;
      }`),
      }
    );

    // Create a new Origin Request Policy for ALB
    const cf = new cloudfront.Distribution(
      this,
      `${props.stage}-${props.appName}-cloudfront-deploy`,
      {
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        domainNames: [tenantStackProps.cloudfrontHostName.toLowerCase()],
        certificate: tenantStackProps.cloudfrontCertificate,
        webAclId: this.envSettings.apiDistributionWebAclArn || undefined,
        defaultBehavior: {
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
          origin: new origins.HttpOrigin(
            this.defaultALBHostname.toLowerCase(),
            {
              protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
              connectionAttempts: 3, // Number of connection attempts for this origin
              connectionTimeout: Duration.seconds(10), // Connection timeout for this origin
              readTimeout: Duration.seconds(55), // Read timeout for this origin
            }
          ),
          functionAssociations: [
            {
              function: cfFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
      }
    );

    new ARecord(this, `${props.stage}-${props.appName}-cloudfront-CDNARecord`, {
      zone: tenantStackProps.cloudfrontHostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cf)),
    });
  }

  private createWAF(props: LocalAppProps) {
    //create a WAF for the ALB

    return new wafv2.CfnWebACL(
      this,
      `${props.stage}-${props.appName}-tenant-WebACL`,
      {
        defaultAction: {
          allow: {},
        },
        scope: 'REGIONAL',
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'MetricForWebACLCDK',
          sampledRequestsEnabled: true,
        },
        name: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-tenant-WebAcl`,
        rules: [
          {
            name: 'CRSRule',
            priority: 0,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesCommonRuleSet',
                ruleActionOverrides: [
                  {
                    name: 'SizeRestrictions_BODY',
                    actionToUse: {
                      allow: {},
                    },
                  },
                  {
                    name: 'SizeRestrictions_QUERYSTRING',
                    actionToUse: {
                      allow: {},
                    },
                  },
                  // required for the inline-styles of the TinyMCE Editor
                  {
                    name: 'CrossSiteScripting_BODY',
                    actionToUse: {
                      allow: {},
                    },
                  },
                  // required for n8n editor
                  {
                    name: 'EC2MetaDataSSRF_BODY',
                    actionToUse: {
                      allow: {},
                    },
                  },
                ],
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'MetricForWebACLCDK-CRS',
            },
          },
          {
            name: 'AWS-AWSManagedRulesAmazonIpReputationList',
            priority: 1,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesAmazonIpReputationList',
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesAmazonIpReputationList',
            },
          },
          {
            name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
            priority: 2,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesKnownBadInputsRuleSet',
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          {
            name: 'AWS-AWSManagedRulesSQLiRuleSet',
            priority: 3,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesSQLiRuleSet',
                scopeDownStatement: {
                  notStatement: {
                    statement: {
                      byteMatchStatement: {
                        searchString: '/v2/query',
                        fieldToMatch: {
                          uriPath: {},
                        },
                        textTransformations: [
                          {
                            priority: 0,
                            type: 'NONE',
                          },
                        ],
                        positionalConstraint: 'STARTS_WITH',
                      },
                    },
                  },
                },
              },
            },
            overrideAction: {
              none: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesSQLiRuleSet',
            },
          },
          {
            name: 'AllowApiTraffic',
            priority: 4,
            statement: {
              andStatement: {
                statements: [
                  {
                    byteMatchStatement: {
                      searchString: '/v1/graphql',
                      fieldToMatch: {
                        uriPath: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                  {
                    byteMatchStatement: {
                      searchString: 'Bearer',
                      fieldToMatch: {
                        singleHeader: {
                          name: 'authorization',
                        },
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                ],
              },
            },
            action: {
              allow: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'BlockNoneApiTraffic',
            },
          },
          {
            name: 'AllowDeployAndConsole',
            priority: 5,
            statement: {
              orStatement: {
                statements: [
                  {
                    byteMatchStatement: {
                      searchString: '/v1',
                      fieldToMatch: {
                        uriPath: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                  {
                    byteMatchStatement: {
                      searchString: '/v2',
                      fieldToMatch: {
                        uriPath: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                  {
                    byteMatchStatement: {
                      searchString: '/console',
                      fieldToMatch: {
                        uriPath: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                  {
                    byteMatchStatement: {
                      searchString: '/api/',
                      fieldToMatch: {
                        uriPath: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'STARTS_WITH',
                    },
                  },
                ],
              },
            },
            action: {
              allow: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AllowDeployVersionCheck',
            },
          },
          {
            name: 'n8n',
            priority: 6,
            statement: {
              orStatement: {
                statements: [
                  {
                    byteMatchStatement: {
                      searchString: 'POST',
                      fieldToMatch: {
                        method: {},
                      },
                      textTransformations: [
                        {
                          priority: 0,
                          type: 'NONE',
                        },
                      ],
                      positionalConstraint: 'EXACTLY',
                    },
                  },
                  {
                    geoMatchStatement: {
                      countryCodes: ['GB'],
                    },
                  },
                ],
              },
            },
            action: {
              allow: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'Temp',
            },
          },
          {
            name: 'BlockNoneApi',
            priority: 7,
            statement: {
              byteMatchStatement: {
                searchString: '/',
                fieldToMatch: {
                  uriPath: {},
                },
                textTransformations: [
                  {
                    priority: 0,
                    type: 'NONE',
                  },
                ],
                positionalConstraint: 'STARTS_WITH',
              },
            },
            action: {
              block: {},
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'BlockOther',
            },
          },
        ],
      }
    );
  }

  private createALB(props: LocalAppProps, tenantStackProps: TenantStackProps) {
    const albSg = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-tenant-SecurityGroupAlb`,
      {
        vpc: this.defaultVPC,
      }
    );

    albSg.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    const alb = new ApplicationLoadBalancer(
      this,
      `${props.stage}-${props.appName}-tenant-alb`,
      {
        vpc: this.defaultVPC,
        internetFacing: true,
        deletionProtection: this.envSettings.loadBalancerDeletionProtection,
        ipAddressType: IpAddressType.IPV4,
        securityGroup: albSg,
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
      }
    );

    new ARecord(this, `${props.stage}-${props.appName}-tenant-AliasRecord`, {
      zone: this.defaultHostedZone,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(alb)),
    });

    new ARecord(
      this,
      `${props.stage}-${props.appName}-integration-AliasRecord`,
      {
        zone: tenantStackProps.integrationHostedZone,
        target: RecordTarget.fromAlias(new LoadBalancerTarget(alb)),
      }
    );

    new CfnWebACLAssociation(
      this,
      `${props.stage}-${props.appName}-tenant-WebACLAssociation`,
      {
        webAclArn: this.defaultWAF.attrArn,
        resourceArn: alb.loadBalancerArn,
      }
    );
    new StringParameter(
      this,
      `${props.stage}-${props.appName}-tenant-ALB-URI-Param`,
      {
        parameterName: `/${props.stage}/${props.appName}/alb-uri`,
        stringValue: alb.loadBalancerDnsName,
      }
    );

    return { alb, albSg };
  }

  private createHasuraListener(props: LocalAppProps) {
    const hasuraEcsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-tenant-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    hasuraEcsSG.addIngressRule(
      Peer.securityGroupId(this.defaultALBSecurityGroup.securityGroupId),
      Port.tcp(80)
    );
    this.defaultALBSecurityGroup.addEgressRule(hasuraEcsSG, Port.tcp(80));

    const hasuraHttpsListener = this.defaultALB.addListener(
      `${props.stage}-${props.appName}-tenant-HttpsListener`,
      {
        port: 443,
        open: true,
        certificates: [this.defaultALBCertificate],
      }
    );

    const func = new Function(
      this,
      `${props.stage}-${props.appName}-tenant-CORS-Handler`,
      {
        code: Code.fromInline(`
      exports.handler = async (event) => {
        // Allow all origins from a <env>.risksmart.link domain, e.g. the app or third-party portal.
        let originHeader = "https://${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}.risksmart.link";
        if(event && event.headers && event.headers.origin && event.headers.origin.includes('${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}.risksmart.link')){
          originHeader = event.headers.origin;
        }
        const response = {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": originHeader,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "authorization,content-type,x-tenant-name,x-confirm-change-request,x-has-file-changes",
                "Access-Control-Max-Age": "6000"
            }
        };
        return response;
    };
      `),
        runtime: Runtime.NODEJS_22_X,
        handler: 'index.handler',
        vpc: this.defaultVPC,
        architecture: Architecture.ARM_64,
      }
    );

    hasuraHttpsListener.addTargets('HTTPSListenerTargets', {
      targets: [new LambdaTarget(func)],
      healthCheck: {
        enabled: true,
      },
    });

    //TODO: this SecurityGroup will be removed when the data-layer is built; trpc will call the data-layer instead of the DB directly
    const trpcDataSgName = `${props.stage}-${props.appName}-TRPCDataSg`;

    const trpcDataSg = new SecurityGroup(this, trpcDataSgName, {
      securityGroupName: trpcDataSgName,
      vpc: this.defaultVPC,
    });

    return { hasuraEcsSG, trpcDataSg, hasuraHttpsListener };
  }

  private createIntegrationFargateServices(
    props: LocalAppProps,
    integrationPlatform: n8nIntegration,
    tenantStackProps: TenantStackProps
  ) {
    const ecsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    ecsSG.addIngressRule(
      Peer.securityGroupId(this.defaultALBSecurityGroup.securityGroupId),
      Port.tcp(integrationPlatform.containerPort)
    );
    this.defaultALBSecurityGroup.addEgressRule(
      ecsSG,
      Port.tcp(integrationPlatform.containerPort)
    );

    const httpslistener = this.defaultALB.addListener(
      `${props.stage}-${props.appName}-${integrationPlatform.name}-HttpsListener`,
      {
        port: integrationPlatform.containerPort,
        protocol: ApplicationProtocol.HTTPS,
        open: true,
        certificates: [tenantStackProps.integrationCertificate],
      }
    );

    const service = new FargateService(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-FargateService`,
      {
        cluster: this.ecsCluster,
        taskDefinition:
          integrationPlatform.taskDefinition as FargateTaskDefinition,
        desiredCount: this.envSettings.n8nDesiredTaskCount ?? 1,
        securityGroups: [ecsSG],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${integrationPlatform.name}-FargateService`,
      }
    );

    const targetGroup = new ApplicationTargetGroup(
      this,
      `${integrationPlatform.name}-TargetGroup`,
      {
        targetGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${integrationPlatform.name}-TGv2`,
        targets: [service],
        vpc: this.defaultVPC,
        port: integrationPlatform.containerPort,
        protocol: ApplicationProtocol.HTTP,
        deregistrationDelay: Duration.seconds(15),
        healthCheck: {
          enabled: true,
          path: '/healthz',
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 2,
          interval: Duration.seconds(6),
          timeout: Duration.seconds(3),
        },
      }
    );

    httpslistener.addAction(
      `${props.stage}-${props.appName}-${integrationPlatform.name}-HttpsListenerRule`,
      {
        action: ListenerAction.forward([targetGroup]),
      }
    );

    integrationPlatform.databaseCluster?.connections.allowFrom(
      service,
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: 'Postgres Port',
        fromPort: 5432,
        toPort: 5432,
      })
    );
  }

  private createPermitFargateServices(
    props: LocalAppProps,
    permit: PermitConfig,
    trpcDataSg: SecurityGroup
  ) {
    const ecsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-${permit.name}-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    ecsSG.addIngressRule(
      Peer.securityGroupId(trpcDataSg.securityGroupId),
      Port.tcp(permit.containerPort)
    );
    trpcDataSg.addEgressRule(ecsSG, Port.tcp(permit.containerPort));

    const service = new FargateService(
      this,
      `${props.stage}-${props.appName}-${permit.name}-FargateService`,
      {
        cluster: this.ecsCluster,
        taskDefinition: permit.taskDefinition as FargateTaskDefinition,
        desiredCount: this.envSettings.permitDesiredTaskCount ?? 1,
        securityGroups: [ecsSG],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${permit.name}-FargateService`,
        serviceConnectConfiguration: {
          logDriver: LogDrivers.awsLogs({
            streamPrefix: permit.name,
          }),
          namespace: 'risksmart.local',
          services: [
            {
              portMappingName: permit.name,
              dnsName: permit.name,
              port: permit.containerPort,
              discoveryName: permit.name,
            },
          ],
        },
      }
    );

    // Attach to internal ALB target group if enabled
    if (this.envSettings.isInternalAlbEnabled) {
      const targetGroupArn = StringParameter.valueForStringParameter(
        this,
        `/${props.stage}/${props.riskSmartRegionProps.awsRegion}/internal-alb/permit-target-group-arn`
      );

      const targetGroup = ApplicationTargetGroup.fromTargetGroupAttributes(
        this,
        'InternalAlbPermitTargetGroup',
        {
          targetGroupArn,
        }
      );

      service.attachToApplicationTargetGroup(targetGroup);
    }

    return service;
  }

  private createExtAPIFargateServices(
    props: LocalAppProps,
    config: ExternalAPIConfig,
    trpcDataSg: SecurityGroup,
    trpcConfig: TRPCConfig
  ) {
    const ecsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-${config.name}-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    // allows trpc to accept requests from the ext-api container.
    trpcDataSg.addIngressRule(ecsSG, Port.tcp(trpcConfig.containerPort));

    const service = new FargateService(
      this,
      `${props.stage}-${props.appName}-${config.name}-FargateService`,
      {
        cluster: this.ecsCluster,
        taskDefinition: config.taskDefinition as FargateTaskDefinition,
        desiredCount: this.envSettings.extAPIDesiredTaskCount ?? 1,
        // auto rollback deployment if task(s) can't reach healthy state.
        circuitBreaker: {
          enable: true,
          rollback: true,
        },
        securityGroups: [ecsSG],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${config.name}-FargateService`,
        serviceConnectConfiguration: {
          logDriver: LogDrivers.awsLogs({
            streamPrefix: config.name,
          }),
          namespace: 'risksmart.local',
          services: [
            {
              portMappingName: config.name,
              dnsName: config.name,
              port: config.containerPort,
              discoveryName: config.name,
            },
          ],
        },
      }
    );

    const targetGroup = new ApplicationTargetGroup(
      this,
      `${config.name}-TargetGroup`,
      {
        targetGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${config.name}-TGv2`,
        targets: [service],
        vpc: this.defaultVPC,
        port: config.containerPort,
        protocol: ApplicationProtocol.HTTP,
        deregistrationDelay: Duration.seconds(15),
        healthCheck: {
          enabled: true,
          path: '/healthz',
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 2,
          interval: Duration.seconds(6),
          timeout: Duration.seconds(3),
        },
      }
    );

    new ApplicationListenerRule(
      this,
      `${props.stage}-${props.appName}-${config.name}-HttpsListenerRule`,
      {
        listener: this.hasuraHttpsListener,
        priority: config.albPriority!,
        action: ListenerAction.forward([targetGroup]),
        conditions: [ListenerCondition.pathPatterns([`/api/v*`])],
      }
    );

    return {
      extAPIService: service,
    };
  }

  private createTrpcFargateServices(
    props: LocalAppProps,
    trpc: TRPCConfig,
    trpcDataSg: SecurityGroup
  ) {
    const ecsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-${trpc.name}-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    const service = new FargateService(
      this,
      `${props.stage}-${props.appName}-${trpc.name}-FargateService`,
      {
        cluster: this.ecsCluster,
        taskDefinition: trpc.taskDefinition as FargateTaskDefinition,
        desiredCount: this.envSettings.trpcDesiredTaskCount ?? 1,
        // auto rollback deployment if task(s) can't reach healthy state.
        circuitBreaker: {
          enable: true,
          rollback: true,
        },
        // Speed up deployments by allowing new tasks to start before old ones stop
        minHealthyPercent: 100,
        maxHealthyPercent: 200,
        securityGroups: [ecsSG, trpcDataSg],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${trpc.name}-FargateService`,
        serviceConnectConfiguration: {
          logDriver: LogDrivers.awsLogs({
            streamPrefix: trpc.name,
          }),
          namespace: 'risksmart.local',
          services: [
            {
              portMappingName: trpc.name,
              dnsName: trpc.name,
              port: trpc.containerPort,
              discoveryName: trpc.name,
            },
          ],
        },
      }
    );

    // TRPC target group and listener listener rule
    const targetGroup = new ApplicationTargetGroup(
      this,
      `${trpc.name}-TargetGroup`,
      {
        targetGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${trpc.name}-TGv2`,
        targets: [service],
        vpc: this.defaultVPC,
        port: trpc.containerPort,
        protocol: ApplicationProtocol.HTTP,
        deregistrationDelay: Duration.seconds(15),
        healthCheck: {
          enabled: true,
          path: '/healthz',
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 2,
          interval: Duration.seconds(6),
          timeout: Duration.seconds(3),
        },
      }
    );

    new ApplicationListenerRule(
      this,
      `${props.stage}-${props.appName}-${trpc.name}-HttpsListenerRule`,
      {
        listener: this.hasuraHttpsListener,
        priority: trpc.albPriority!,
        action: ListenerAction.forward([targetGroup]),
        conditions: [ListenerCondition.pathPatterns([`/trpc/*`])],
      }
    );

    return {
      trpcService: service,
    };
  }

  private createMcpFargateServices(props: LocalAppProps, mcp: MCPConfig) {
    const ecsSG = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-${mcp.name}-FargateSecurityGroup`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
      }
    );

    const service = new FargateService(
      this,
      `${props.stage}-${props.appName}-${mcp.name}-FargateService`,
      {
        cluster: this.ecsCluster,
        taskDefinition: mcp.taskDefinition as FargateTaskDefinition,
        desiredCount: this.envSettings.mcpDesiredTaskCount ?? 1,
        circuitBreaker: {
          enable: true,
          rollback: true,
        },
        healthCheckGracePeriod: Duration.seconds(60),
        minHealthyPercent: 100,
        maxHealthyPercent: 200,
        securityGroups: [ecsSG],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${mcp.name}-FargateService`,
      }
    );

    const targetGroup = new ApplicationTargetGroup(
      this,
      `${mcp.name}-TargetGroup`,
      {
        targetGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${mcp.name}-TGv2`,
        targets: [service],
        vpc: this.defaultVPC,
        port: mcp.containerPort,
        protocol: ApplicationProtocol.HTTP,
        deregistrationDelay: Duration.seconds(15),
        healthCheck: {
          enabled: true,
          path: '/health',
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 3,
          interval: Duration.seconds(15),
          timeout: Duration.seconds(5),
        },
      }
    );

    new ApplicationListenerRule(
      this,
      `${props.stage}-${props.appName}-${mcp.name}-HttpsListenerRule`,
      {
        listener: this.hasuraHttpsListener,
        priority: mcp.albPriority!,
        action: ListenerAction.forward([targetGroup]),
        conditions: [ListenerCondition.pathPatterns([`/mcp/*`])],
      }
    );

    return {
      mcpService: service,
    };
  }

  private createECSCluster(props: LocalAppProps) {
    // Create an ECS cluster
    const cluster = new ecs.Cluster(
      this,
      `${props.stage}-${props.appName}-allTenants-cluster`,
      {
        clusterName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-allTenants-cluster`,
        containerInsightsV2: ecs.ContainerInsights.ENABLED,
        vpc: this.defaultVPC,
        defaultCloudMapNamespace: {
          name: 'risksmart.local',
          useForServiceConnect: true,
          type: NamespaceType.HTTP,
          vpc: this.defaultVPC,
        },
      }
    );

    return cluster;
  }

  private addEcrPullPolicies(
    props: LocalAppProps,
    taskDefinition: FargateTaskDefinition,
    ecrRepoName: string
  ): void {
    taskDefinition.addToExecutionRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*'],
      })
    );
    taskDefinition.addToExecutionRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ecr:BatchGetImage',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetAuthorizationToken',
        ],
        resources: [
          `arn:aws:ecr:${props.riskSmartRegionProps.awsRegion}:437474201705:repository/${ecrRepoName}`,
        ],
      })
    );
  }

  private createTaskDefinitionIntegration(
    props: LocalAppProps,
    n8nIntegration: n8nIntegration,
    tenantStackProps: TenantStackProps
  ) {
    // Use ECR image - version is provided via INTEGRATIONS_CONTAINER_BUILD env var
    const integrationsContainerBuild = process.env.INTEGRATIONS_CONTAINER_BUILD;

    if (!integrationsContainerBuild) {
      throw new Error(
        'INTEGRATIONS_CONTAINER_BUILD environment variable is required. ' +
          'This should be set to the semver tag of the integrations Docker image in ECR (e.g., "1.0.0"). ' +
          'The image must be built and pushed to ECR before deployment.'
      );
    }

    const integrationsImage = ContainerImage.fromRegistry(
      `437474201705.dkr.ecr.${props.riskSmartRegionProps.awsRegion}.amazonaws.com/${this.envSettings.integrationsEcrRepoName}:${integrationsContainerBuild}`
    );

    const createContainer: ContainerDefinitionOptions = {
      readonlyRootFilesystem: false,
      portMappings: [
        {
          containerPort: n8nIntegration.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      cpu: 1024,
      memoryLimitMiB: 2048,
      image: integrationsImage,
      logging: LogDrivers.awsLogs({
        streamPrefix: `${props.stage}-${props.appName}-${integrationPlatform.name}`,
        logRetention: RetentionDays.TWO_YEARS,
      }),

      environment: {
        DB_TYPE: integrationPlatform.dbType,
        DB_POSTGRESDB_DATABASE: integrationPlatform.database || '',
        DB_POSTGRESDB_HOST: integrationPlatform.databaseHost || '',
        DB_POSTGRESDB_PORT: integrationPlatform.databasePort?.toString() || '',
        DB_POSTGRESDB_USER: integrationPlatform.databaseUser || '',
        N8N_LOG_LEVEL: props.stage === 'dev-cloud' ? 'debug' : 'info',
        N8N_LOG_FORMAT: 'json',
        N8N_DIAGNOSTICS_ENABLED: 'false',
        N8N_VERSION_NOTIFICATIONS_ENABLED: 'false',
        N8N_TEMPLATES_ENABLED: 'false',
        N8N_HIRING_BANNER_ENABLED: 'false',
        N8N_HOST: tenantStackProps.integrationHostName,
        N8N_PORT: integrationPlatform.containerPort.toString(),
        N8N_PROTOCOL: 'https',
        NODE_ENV: 'production',
        WEBHOOK_URL: `https://${
          tenantStackProps.integrationHostName
        }:${integrationPlatform.containerPort.toString()}/`,
        GENERIC_TIMEZONE: 'GB',

        RS_API_DOMAIN: tenantStackProps.cloudfrontHostName.toLowerCase(),
        RS_INTEGRATIONS_API_DOMAIN: tenantStackProps.restApiDomain,
      },
      secrets:
        integrationPlatform.databaseSecret &&
        integrationPlatform.encryptionString
          ? {
              DB_POSTGRESDB_PASSWORD: ecs.Secret.fromSecretsManager(
                integrationPlatform.databaseSecret,
                'password'
              ),
              N8N_ENCRYPTION_KEY: ecs.Secret.fromSecretsManager(
                integrationPlatform.encryptionString
              ),
            }
          : {},
      healthCheck: {
        command: ['CMD-SHELL', 'exit 0'],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(3),
        retries: 2,
        startPeriod: Duration.seconds(10),
      },
    };

    const taskDefinition = new FargateTaskDefinition(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-TaskDefinition`,
      {
        cpu: 1024,
        memoryLimitMiB: 2048,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
      }
    );
    taskDefinition.addContainer('Integrations', createContainer);

    // Add ECR permissions when using pre-built image from CI account
    if (integrationsContainerBuild) {
      const ecrPolicyStatement = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ecr:BatchGetImage',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchCheckLayerAvailability',
        ],
        resources: [
          `arn:aws:ecr:${props.riskSmartRegionProps.awsRegion}:437474201705:repository/${this.envSettings.integrationsEcrRepoName}`,
        ],
      });
      const getAuthorizationTokenStatement = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*'],
      });
      taskDefinition.addToExecutionRolePolicy(getAuthorizationTokenStatement);
      taskDefinition.addToExecutionRolePolicy(ecrPolicyStatement);
    }

    integrationPlatform.taskDefinition = taskDefinition;
  }

  private createTaskDefinitionPermit(
    props: LocalAppProps,
    permit: PermitConfig
  ) {
    // Create task definition first so we can pass it to addFireLensLogging
    const taskDefinition = new FargateTaskDefinition(
      this,
      `${props.stage}-${props.appName}-${permit.name}-TaskDefinition`,
      {
        cpu: 4096,
        memoryLimitMiB: 8192, // Testing with more RAM as usage was very high
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
      }
    );

    // Add FireLens logging (requires task definition to be created first)
    const fireLensLogDriver = addFireLensLogging(
      { stage: props.stage, appName: props.appName, serviceName: permit.name },
      permit,
      taskDefinition
    );

    const createContainer: ContainerDefinitionOptions = {
      readonlyRootFilesystem: false,
      portMappings: [
        {
          name: permit.name,
          containerPort: permit.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      cpu: 3790,
      memoryLimitMiB: 7630,
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.${this.region}.amazonaws.com/${
          this.envSettings.permitEcrRepoName
        }:${permit.imageTag}`
      ),
      logging: fireLensLogDriver,
      environment: {
        PDP_OPA_CLIENT_QUERY_TIMEOUT: '30',
        PDP_DEBUG: 'false',
        // Enable structured JSON logs for FluentBit parsing
        OPAL_LOG_SERIALIZE: 'true',
        // Enable Permit PDP native Datadog APM tracing
        PDP_ENABLE_MONITORING: 'true',
        OPAL_ENABLE_DATADOG_APM: 'true',
        // Unified Service Tagging
        ...getDatadogEnvVars(permit.name, props.stage, permit.imageTag),
      },
      secrets: permit.permitSecret
        ? {
            PDP_API_KEY: ecs.Secret.fromSecretsManager(permit.permitSecret),
          }
        : {},
      healthCheck: {
        command: [
          'CMD-SHELL',
          'wget --no-verbose --tries=1 --spider http://127.0.0.1:7000/healthy || exit 1',
        ],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(3),
        retries: 2,
        startPeriod: Duration.seconds(30),
      },
    };

    taskDefinition.addContainer('Permit', createContainer);
    addDatadogAgent(
      { stage: props.stage, appName: props.appName, serviceName: permit.name },
      permit,
      taskDefinition
    );
    const ecrPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecr:BatchGetImage',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetAuthorizationToken',
      ],
      resources: [
        `arn:aws:ecr:${this.region}:437474201705:repository/${
          this.envSettings.permitEcrRepoName
        }`,
      ],
    });
    const getAuthorizationTokenStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ecr:GetAuthorizationToken'],
      resources: ['*'],
    });
    taskDefinition.addToExecutionRolePolicy(getAuthorizationTokenStatement);
    taskDefinition.addToExecutionRolePolicy(ecrPolicyStatement);
    permit.taskDefinition = taskDefinition;
  }

  private createTaskDefinitionExtAPI(
    props: LocalAppProps,
    config: ExternalAPIConfig,
    trpc: TRPCConfig,
    tenantStackProps: TenantStackProps
  ) {
    const { hasuraAdminSecret } = tenantStackProps;
    // Create task definition first so we can pass it to addFireLensLogging
    const taskDefinition = new FargateTaskDefinition(
      this,
      `${props.stage}-${props.appName}-${config.name}-TaskDefinition`,
      {
        cpu: 2048,
        memoryLimitMiB: 4096,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
      }
    );

    // Add FireLens logging (requires task definition to be created first)
    const fireLensLogDriver = addFireLensLogging(
      { stage: props.stage, appName: props.appName, serviceName: config.name },
      config,
      taskDefinition,
      config.extAPIContainerBuild
    );

    // app container secrets
    const apiDocsSigningKeyKms = new Key(
      this,
      `${props.stage}-${props.appName}-${config.name}-docs-kms`,
      {
        description: 'KMS key for ext-api docs signed links key secret',
        enableKeyRotation: true,
        removalPolicy: this.envSettings.extAPIResourceRemovalPolicy,
      }
    );
    const apiDocsSigningKeySecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${config.name}-docs-secret`,
      {
        secretName: `/${props.stage}-${props.appName}-${config.name}/ext-api/api-docs-signing-key`,
        description: 'Signing key for external API documentation links',
        encryptionKey: apiDocsSigningKeyKms,
        generateSecretString: {
          // secret stored as JSON { "value": "<secret_string_here>" }
          secretStringTemplate: JSON.stringify({}),
          generateStringKey: 'value',
          passwordLength: 64,
          excludePunctuation: true,
          includeSpace: false,
        },
      }
    );
    apiDocsSigningKeyKms.grantDecrypt(taskDefinition.executionRole!);
    apiDocsSigningKeySecret.grantRead(taskDefinition.executionRole!);

    hasuraAdminSecret.grantRead(taskDefinition.executionRole!);

    const containerDefinition: ContainerDefinitionOptions = {
      containerName: `${config.name}-app`,
      readonlyRootFilesystem: true,
      portMappings: [
        {
          name: config.name,
          containerPort: config.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      entryPoint: ['node', 'dist/index.js'],
      cpu: 1024,
      memoryLimitMiB: 2048,
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.${props.riskSmartRegionProps.awsRegion}.amazonaws.com/${
          this.envSettings.extAPIEcrRepoName
        }:${config.extAPIContainerBuild}`
      ),
      // logging: LogDrivers.awsLogs({
      //   streamPrefix: `${props.stage}-${props.appName}-${config.name}`,
      //   logRetention: RetentionDays.TWO_YEARS,
      // }),
      logging: fireLensLogDriver,
      environment: {
        LOG_LEVEL: 'INFO',
        TRPC_SERVICE_BASE_URL: `http://${trpc.name}:${trpc.containerPort}`,
        DATA_CLIENT_TYPE: 'trpc',
        PORT: `${config.containerPort}`,
        AUTH_CONFIG: config.authProviderConfig,
        AUTH_JWT_PROVIDERS: JSON.stringify(config.authJwtProviders),
        RATE_LIMIT_TBL_NAME: config.rateLimitTableName,
        ALLOWED_RS_USER_ROLES:
          '["RiskManager", "CustomerSupport", "TechnicalSupport"]',
        APP_ENVIRONMENT: props.stage,
        // Unified Service Tagging for app container
        ...getDatadogEnvVars(
          config.name,
          props.stage,
          config.extAPIContainerBuild
        ),
        HASURA_ENDPOINT: `https://${config.hasuraDomain}/v1/graphql`,
        APP_DOMAIN: config.appDomain,
      },
      secrets: {
        API_DOCS_SIGNING_KEY: ecs.Secret.fromSecretsManager(
          apiDocsSigningKeySecret,
          'value'
        ),
        HASURA_ADMIN_SECRET: ecs.Secret.fromSecretsManager(hasuraAdminSecret),
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          `wget --no-verbose --tries=1 --spider http://127.0.0.1:${config.containerPort}/healthz || exit 1`,
        ],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(3),
        retries: 3,
        startPeriod: Duration.seconds(30),
      },
    };

    taskDefinition.addContainer('ExtAPI', containerDefinition);
    addDatadogAgent(
      { stage: props.stage, appName: props.appName, serviceName: config.name },
      config,
      taskDefinition
    );
    this.addEcrPullPolicies(
      props,
      taskDefinition,
      this.envSettings.extAPIEcrRepoName
    );

    // IAM polices for container task.
    const rateLimitDynamoTable = TableV2.fromTableArn(
      this,
      'ExtAPIRateLimitTable',
      config.rateLimitTableArn
    );
    rateLimitDynamoTable.grantReadWriteData(taskDefinition.taskRole);

    const clientDynamoTable = TableV2.fromTableArn(
      this,
      'ExtAPIClientTable',
      config.clientTableArn
    );
    clientDynamoTable.grantReadWriteData(taskDefinition.taskRole);
    // ensure reads can target GSIs
    taskDefinition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        actions: [
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:BatchGetItem',
        ],
        resources: [
          clientDynamoTable.tableArn,
          `${clientDynamoTable.tableArn}/index/*`,
          rateLimitDynamoTable.tableArn,
          `${rateLimitDynamoTable.tableArn}/index/*`,
        ],
      })
    );

    const clientUserPool = UserPool.fromUserPoolId(
      this,
      'ExtAPIClientUserPool',
      config.userPoolId
    );
    taskDefinition.addToTaskRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'cognito-idp:CreateUserPoolClient',
          'cognito-idp:DeleteUserPoolClient',
          'cognito-idp:ListUserPoolClients',
        ],
        resources: [clientUserPool.userPoolArn],
      })
    );

    config.taskDefinition = taskDefinition;
  }

  private createTaskDefinitionTrpc(
    props: LocalAppProps,
    trpc: TRPCConfig,
    permit: PermitConfig,
    tenantStackProps: TenantStackProps
  ) {
    // Create a custom execution role so we can grant SSM read access
    const trpcExecutionRole = new Role(this, 'TrpcExecutionRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    });

    // Create task definition first so we can pass it to addFireLensLogging
    const taskDefinition = new FargateTaskDefinition(
      this,
      `${props.stage}-${props.appName}-${trpc.name}-TaskDefinition`,
      {
        cpu: 2048,
        memoryLimitMiB: 4096,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
        executionRole: trpcExecutionRole,
      }
    );

    // Extract SSM parameter for Auth0 client secret
    const auth0ClientSecretParameter =
      StringParameter.fromSecureStringParameterAttributes(
        this,
        'TrpcAuth0ClientSecret',
        {
          parameterName: `/sst/risksmart-app/${props.stage}/Secret/AUTH0_CLIENT_SECRET/value`,
        }
      );

    // Grant the execution role permission to read the Auth0 client secret
    auth0ClientSecretParameter.grantRead(trpcExecutionRole);

    // Allow KMS decrypt for SSM parameters encrypted with customer-managed keys
    trpcExecutionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['kms:Decrypt'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'kms:ViaService': `ssm.${Stack.of(this).region}.amazonaws.com`,
          },
        },
      })
    );

    // Add FireLens logging (requires task definition to be created first)
    const fireLensLogDriver = addFireLensLogging(
      { stage: props.stage, appName: props.appName, serviceName: trpc.name },
      trpc,
      taskDefinition,
      trpc.trpcContainerBuild
    );

    const createContainer: ContainerDefinitionOptions = {
      readonlyRootFilesystem: false,
      portMappings: [
        {
          name: trpc.name,
          containerPort: trpc.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      entryPoint: [
        'node',
        '--experimental-require-module',
        '--import',
        './dist/tracer.js',
        '--import',
        './dist/instrument.js',
        './dist/app.js',
      ],
      cpu: 1742,
      memoryLimitMiB: 3484,
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.${props.riskSmartRegionProps.awsRegion}.amazonaws.com/${
          this.envSettings.trpcEcrRepoName
        }:${trpc.trpcContainerBuild}`
      ),
      logging: fireLensLogDriver,
      environment: {
        PDP_ENDPOINT: `http://${permit.name}:${permit.containerPort}`,
        //TODO: Why is this not a secret?
        JWT_SECRET_CONFIG: `${tenantStackProps.jwtSecret.toString()}`,
        COMMON_EVENT_BUS_NAME: `${props.stage}-${props.appName}-CommonEventBus`,
        TENANT_CONFIG_TABLE: `${props.stage}-risksmartApp-GlobalTenantConfig`,
        SENTRY_ENVIRONMENT: props.stage,
        SENTRY_DSN: trpc.sentryDsn,
        TRPC_CONTAINER_BUILD: trpc.trpcContainerBuild,
        DATA_LAYER_CLIENT_API_URL_SSM_PARAM: `/${props.stage}/${props.appName}/api/data-layer/client-url`,
        REQUEST_STATE_API_URL_SSM_PARAM: `/${props.stage}/${props.appName}/api/request-state/url`,
        AI_FEEDBACK_API_URL_SSM_PARAM: `/${props.stage}/${props.appName}/api/ai-feedback-ingestion/url`,
        // Auth0 configuration
        AUTH0_DOMAIN: trpc.auth0Domain,
        AUTH0_MANAGEMENT_CLIENT_ID: trpc.auth0ManagementClientId,
        AUTH0_RISK_SMART_REST_API_CLIENT_ID: trpc.auth0RiskSmartRestApiClientId,
        REACT_APP_AUTH0_CLIENT_ID: trpc.auth0ClientId,
        // Unified Service Tagging for app container
        ...getDatadogEnvVars(trpc.name, props.stage, trpc.trpcContainerBuild),
      },
      secrets: {
        ...(permit.permitSecret && {
          PDP_API_KEY: ecs.Secret.fromSecretsManager(permit.permitSecret),
        }),
        AUTH0_CLIENT_SECRET: ecs.Secret.fromSsmParameter(
          auth0ClientSecretParameter
        ),
      },
      stopTimeout: Duration.seconds(5),
      healthCheck: {
        command: [
          'CMD-SHELL',
          `wget --no-verbose --tries=1 --spider http://127.0.0.1:2021/healthz || exit 1`,
        ],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(3),
        retries: 2,
        startPeriod: Duration.seconds(30),
      },
    };

    taskDefinition.addContainer('TRPC', createContainer);
    addDatadogAgent(
      { stage: props.stage, appName: props.appName, serviceName: trpc.name },
      trpc,
      taskDefinition
    );
    this.addEcrPullPolicies(
      props,
      taskDefinition,
      this.envSettings.trpcEcrRepoName
    );

    // Policies for the task role.
    // These are the permissions the container will have.
    const dynamoDBTenantConfigPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
      resources: [
        getGlobalTenantConfigTableArn(props.stage, this.region),
        `${getGlobalTenantConfigTableArn(props.stage, this.region)}/index/*`,
        //Fallback to eu-west-1 for DR
        getGlobalTenantConfigTableArn(props.stage, 'eu-west-1'),
        `${getGlobalTenantConfigTableArn(props.stage, 'eu-west-1')}/index/*`,
      ],
    });
    const dynamoDBRequestEventPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:GetItem'],
      resources: [
        // Grant access to all tenant event tables created by TenantEventStack
        `arn:aws:dynamodb:${this.region}:${Stack.of(this).account}:table/${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-*-RequestEventTable`,
      ],
    });
    const rdsSecretPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        `arn:aws:secretsmanager:${this.region}:${Stack.of(this).account}:secret:${props.stage}-${props.appName}-*-ConnectionSecret-??????`,
        `arn:aws:secretsmanager:${this.region}:${Stack.of(this).account}:secret:${props.stage}-${props.appName}-*-DataLayerConnectionSecret-??????`,
      ],
    });

    const eventBridgePolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['events:PutEvents', 'events:DescribeEventBus'],
      resources: [tenantStackProps.commonEventBus.eventBusArn],
    });

    // Grant permissions to read SSM parameters for service discovery
    const ssmParameterPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: [
        `arn:aws:ssm:${this.region}:${Stack.of(this).account}:parameter/${props.stage}/${props.appName}/api/*`,
      ],
    });

    // Grant permissions to invoke internal REST APIs (IAM authorized)
    const apiGatewayInvokePolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['execute-api:Invoke'],
      resources: [
        // Grant invoke access to all methods and paths for any API in the current stage
        `arn:aws:execute-api:${this.region}:${Stack.of(this).account}:*/${props.stage}/*/*`,
      ],
    });

    taskDefinition.addToTaskRolePolicy(rdsSecretPolicyStatement);
    taskDefinition.addToTaskRolePolicy(dynamoDBTenantConfigPolicyStatement);
    taskDefinition.addToTaskRolePolicy(dynamoDBRequestEventPolicyStatement);
    taskDefinition.addToTaskRolePolicy(eventBridgePolicyStatement);
    taskDefinition.addToTaskRolePolicy(ssmParameterPolicyStatement);
    taskDefinition.addToTaskRolePolicy(apiGatewayInvokePolicyStatement);
    trpc.taskDefinition = taskDefinition;
  }

  private createTaskDefinitionMcp(
    props: LocalAppProps,
    mcp: MCPConfig,
    tenantStackProps: TenantStackProps
  ) {
    // Auth0 Management Client Id/Secret for DCR proxy (stored in SSM Parameter Store)
    const sstStage = props.stage === 'app' ? 'prod' : props.stage;
    const getSstSecretParameterName = (name: string) =>
      `/sst/risksmart-app/${sstStage}/Secret/${name}/value`;

    const mcpExecutionRole = new Role(this, 'McpExecutionRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    });

    const taskDefinition = new FargateTaskDefinition(
      this,
      `${props.stage}-${props.appName}-${mcp.name}-TaskDefinition`,
      {
        cpu: 1024,
        memoryLimitMiB: 2048,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
        executionRole: mcpExecutionRole,
      }
    );

    const fireLensLogDriver = addFireLensLogging(
      { stage: props.stage, appName: props.appName, serviceName: mcp.name },
      mcp,
      taskDefinition,
      mcp.mcpContainerBuild
    );

    const auth0ManagementClientIdParameter =
      StringParameter.fromSecureStringParameterAttributes(
        this,
        'McpAuth0ManagementClientIdParameter',
        {
          parameterName: getSstSecretParameterName(
            'MCP_AUTH0_MANAGEMENT_CLIENT_ID'
          ),
        }
      );

    const auth0ManagementClientSecretParameter =
      StringParameter.fromSecureStringParameterAttributes(
        this,
        'McpAuth0ManagementClientSecretParameter',
        {
          parameterName: getSstSecretParameterName(
            'MCP_AUTH0_MANAGEMENT_SECRET'
          ),
        }
      );

    // Ensure the ECS execution role can read these parameters at task startup.
    auth0ManagementClientIdParameter.grantRead(mcpExecutionRole);
    auth0ManagementClientSecretParameter.grantRead(mcpExecutionRole);

    // If these parameters are encrypted under a customer-managed KMS key,
    // ECS may require decrypt permission via the SSM service.
    mcpExecutionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['kms:Decrypt'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'kms:ViaService': `ssm.${Stack.of(this).region}.amazonaws.com`,
          },
        },
      })
    );

    const mcpServerUrl = `https://${this.defaultALBHostname}/mcp`;

    const createContainer: ContainerDefinitionOptions = {
      readonlyRootFilesystem: true,
      portMappings: [
        {
          name: mcp.name,
          containerPort: mcp.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      entryPoint: ['node', 'dist/app.js'],
      cpu: 718,
      memoryLimitMiB: 1434,
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.${props.riskSmartRegionProps.awsRegion}.amazonaws.com/${
          this.envSettings.mcpEcrRepoName
        }:${mcp.mcpContainerBuild}`
      ),
      logging: fireLensLogDriver,
      environment: {
        JWT_SECRET_CONFIG: `${tenantStackProps.jwtSecret.toString()}`,
        TRPC_SERVICE_BASE_URL: `https://${this.defaultALBHostname}`,
        MCP_SERVER_URL: mcpServerUrl,
        AUTH0_DOMAIN: mcp.auth0Domain,
        AUTH0_API_AUDIENCE: mcp.auth0ApiAudience,
        PORT: `${mcp.containerPort}`,
        ...getDatadogEnvVars(mcp.name, props.stage, mcp.mcpContainerBuild),
      },
      secrets: {
        AUTH0_MANAGEMENT_CLIENT_ID: ecs.Secret.fromSsmParameter(
          auth0ManagementClientIdParameter
        ),
        AUTH0_MANAGEMENT_CLIENT_SECRET: ecs.Secret.fromSsmParameter(
          auth0ManagementClientSecretParameter
        ),
      },
      stopTimeout: Duration.seconds(5),
      healthCheck: {
        command: [
          'CMD-SHELL',
          `wget --no-verbose --tries=1 --spider http://127.0.0.1:${mcp.containerPort}/health || exit 1`,
        ],
        interval: Duration.seconds(15),
        timeout: Duration.seconds(3),
        retries: 2,
        startPeriod: Duration.seconds(30),
      },
    };

    taskDefinition.addContainer('MCP', createContainer);
    addDatadogAgent(
      { stage: props.stage, appName: props.appName, serviceName: mcp.name },
      mcp,
      taskDefinition
    );
    this.addEcrPullPolicies(
      props,
      taskDefinition,
      this.envSettings.mcpEcrRepoName
    );

    mcp.taskDefinition = taskDefinition;
  }

  private createCertificates(props: LocalAppProps) {
    //Create a certificate default domain
    //Future to create a certificate per tenant if separate vpc

    const defaultALBCertificate = new Certificate(
      this,
      `${props.stage}-${props.appName}-tenant-Certificate`,
      {
        domainName: this.defaultALBHostname,
        validation: CertificateValidation.fromDns(this.defaultHostedZone),
      }
    );

    defaultALBCertificate
      .metricDaysToExpiry()
      .createAlarm(
        this,
        `${props.stage}-${props.appName}-tenant-CertificateExpiryAlarm`,
        {
          evaluationPeriods: 1,
          threshold: 45,
          comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        }
      );

    return defaultALBCertificate;
  }

  //For both tenants and integrations
  private createDomain(props: LocalAppProps) {
    //create default domain
    //create a domain per vpc in future
    if (!props.baseDomain) {
      throw new Error('baseDomain required');
    }

    this.defaultALBHostname = `${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}-${props.appName}-tenant.${props.baseDomain}`;
    this.defaultHostedZone = new HostedZone(
      this,
      `${props.stage}-${props.appName}-tenant-HostedZone`,
      {
        zoneName: this.defaultALBHostname,
      }
    );

    const nameServers: string[] = this.defaultHostedZone.hostedZoneNameServers!;
    const rootZone = HostedZone.fromLookup(
      this,
      `${props.stage}-${props.appName}-tenant-Zone`,
      {
        domainName: props.baseDomain,
      }
    );
    new ZoneDelegationRecord(
      this,
      `${props.stage}-${props.appName}-tenant-ZoneDelegationRecord`,
      {
        recordName: this.defaultALBHostname,
        nameServers,
        zone: rootZone,
      }
    );

    return {
      defaultALBHostname: this.defaultALBHostname,
      defaultHostedZone: this.defaultHostedZone,
    };
  }

  private createIntegrationsBackupPlan(
    props: LocalAppProps,
    n8nIntegration: n8nIntegration
  ) {
    const backupVault = new BackupVault(
      this,
      `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-${props.appName}-${n8nIntegration.name}-BackupVault`,
      {
        removalPolicy: this.envSettings.backupVaultRemovalPolicy,
        backupVaultName: props.riskSmartRegionProps.isRiskSmartRegion
          ? `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${n8nIntegration.name}`
          : `${props.stage}-${props.appName}-${n8nIntegration.name}-Vault`,
        encryptionKey: n8nIntegration.kmsKey,
      }
    );

    const plan = new BackupPlan(
      this,
      `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-${props.appName}-${n8nIntegration.name}-BackupVault-BackupPlan`
    );
    if (this.envSettings.addWeeklyBackups) {
      plan.addRule(BackupPlanRule.weekly(backupVault));
    }
    plan.addRule(BackupPlanRule.monthly5Year(backupVault));

    plan.addSelection(
      `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-${props.appName}-${n8nIntegration.name}-BackupVault-BackupSelection`,
      {
        resources: [
          BackupResource.fromRdsDatabaseCluster(
            n8nIntegration.databaseCluster as DatabaseCluster
          ),
        ],
      }
    );
  }

  private createVPC(props: LocalAppProps) {
    // When we offer separate VPCs we can inspect the tenant object and create a new VPC for each tenant
    const vpc = new Vpc(this, `${props.stage}-${props.appName}-tenant-VPC`, {
      vpcName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-tenant-VPC`,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      reservedAzs: 3,
      maxAzs: props.riskSmartRegionProps.isRiskSmartRegion ? 3 : 2,
      natGateways: this.envSettings.natGateways,
      ipAddresses: IpAddresses.cidr('172.31.0.0/16'),
      subnetConfiguration: [
        {
          name: 'public-subnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: false,
        },
        {
          name: 'private-subnet',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet',
          subnetType: SubnetType.PRIVATE_ISOLATED,
          cidrMask: 20,
        },
      ],
    });
    vpc.addGatewayEndpoint('S3GatewayVpcEndpoint', {
      service: GatewayVpcEndpointAwsService.S3,
    });

    vpc.addInterfaceEndpoint('EcrDockerVpcEndpoint', {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    vpc.addInterfaceEndpoint('EcrVpcEndpoint', {
      service: InterfaceVpcEndpointAwsService.ECR,
    });

    vpc.addInterfaceEndpoint('CloudWatchLogsVpcEndpoint', {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    vpc.addInterfaceEndpoint('EventbridgeVpcEndpoint', {
      service: InterfaceVpcEndpointAwsService.EVENTBRIDGE,
    });

    vpc.addInterfaceEndpoint('EC2VpcEndpoint', {
      service: InterfaceVpcEndpointAwsService.EC2,
    });

    vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    this.apiGatewayVpcEndpoint = vpc.addInterfaceEndpoint(
      'ApiGatewayEndpoint',
      {
        service: InterfaceVpcEndpointAwsService.APIGATEWAY,
      }
    );

    vpc.addGatewayEndpoint('DynamodbEndpoint', {
      service: GatewayVpcEndpointAwsService.DYNAMODB,
    });

    new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-tenant-noInboundAllOutboundSecurityGroup`,
      {
        securityGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-tenant-noInboundAllOutboundSecurityGroup`,
        vpc: vpc,
        allowAllOutbound: true,
      }
    );

    const vpcRole = new Role(
      this,
      `${props.stage}-${props.appName}-tenant-VPC-RoleVpcFlowLogs`,
      {
        assumedBy: new ServicePrincipal('vpc-flow-logs.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccessV2'),
        ],
      }
    );

    const logGroup = new LogGroup(
      this,
      `${props.stage}-${props.appName}-VpcFlowLogGroup`,
      {
        retention: RetentionDays.TWO_YEARS,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );

    new LogStream(this, `${props.stage}-${props.appName}-VpcFlowLogStream`, {
      logGroup: logGroup,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    new FlowLog(this, `${props.stage}-${props.appName}-VpcFlowLog`, {
      resourceType: FlowLogResourceType.fromVpc(vpc),
      destination: FlowLogDestination.toCloudWatchLogs(logGroup, vpcRole),
      trafficType: FlowLogTrafficType.ALL,
    });

    return vpc;
  }

  private createIntegrationDBClusters(
    props: LocalAppProps,
    integrationPlatform: n8nIntegration
  ) {
    if (!integrationPlatform.databaseSecret) {
      throw new Error(
        `Database secret not found for ${integrationPlatform.name}`
      );
    }

    const dbProps: DatabaseClusterFromSnapshotProps | DatabaseClusterProps = {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_16_1,
      }),
      writer: ClusterInstance.serverlessV2('writer', {}),
      instanceUpdateBehaviour: InstanceUpdateBehaviour.ROLLING,
      vpc: this.defaultVPC,
      vpcSubnets: {
        subnets: this.defaultVPC.isolatedSubnets,
      },
      credentials: Credentials.fromSecret(integrationPlatform.databaseSecret),
      backup: {
        retention: Duration.days(integrationPlatform.backupRetentionDays),
      },
      clusterIdentifier:
        `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${integrationPlatform.name}-DBCluster`.toLowerCase(),
      serverlessV2MaxCapacity:
        props.stage == 'app' ? integrationPlatform.maxDbCapacity : 5,
      serverlessV2MinCapacity:
        props.stage == 'app' ? integrationPlatform.minDbCapacity : 0.5,
      storageEncryptionKey: integrationPlatform.kmsKey,
      cloudwatchLogsExports: ['postgresql'],
      iamAuthentication: true,
      cloudwatchLogsRetention: RetentionDays.ONE_MONTH,
      deletionProtection: this.envSettings.databaseDeletionProtection,
      removalPolicy: this.envSettings.databaseRemovalPolicy,
      defaultDatabaseName: integrationPlatform.database,
    };

    integrationPlatform.databaseCluster = new DatabaseCluster(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-DBAuroraCluster`,
      dbProps
    );

    integrationPlatform.databaseHost =
      integrationPlatform.databaseCluster.clusterEndpoint.hostname;
    integrationPlatform.databasePort =
      integrationPlatform.databaseCluster.clusterEndpoint.port;
  }

  private createIntegrationAwsUser(
    props: LocalAppProps,
    integration: n8nIntegration
  ) {
    const policy = new Policy(
      this,
      `${props.stage}-${integration.iamUser}-Policy`,
      {
        statements: [
          new PolicyStatement({
            actions: [
              'sns:ConfirmSubscription',
              'sns:SetSubscriptionAttributes',
              'sns:Publish',
              'sns:Subscribe',
              'sns:Unsubscribe',
            ],
            // The SNS topic and event bus are created in the SST stack.
            // The two steps (this and SST) run in parallel so it's hard to share the ARN across stacks. Need to find a workaround.
            resources: ['*'],
            effect: Effect.ALLOW,
          }),
        ],
      }
    );

    const user = new User(this, `${props.stage}-${integration.iamUser}`, {
      userName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${integration.iamUser}`,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSReadOnlyAccess'),
      ],
    });

    user.attachInlinePolicy(policy);

    const accessKey = new AccessKey(
      this,
      `${props.stage}-${integration.iamUser}-key`,
      {
        user,
      }
    );

    integrationPlatform.iamUserSecret = new Secret(
      this,
      `${props.stage}-${integration.iamUser}-secret`,
      {
        secretObjectValue: {
          accessKey: SecretValue.unsafePlainText(accessKey.accessKeyId),
          secretKey: accessKey.secretAccessKey,
        },
      }
    );
  }

  private createIntegrationSecrets(
    props: LocalAppProps,
    integrationPlatform: n8nIntegration
  ) {
    integrationPlatform.databaseSecret = new Secret(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-DBSecret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${integrationPlatform.name}-N8NDatabaseSecret`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: integrationPlatform.databaseUser,
          }),
          generateStringKey: 'password',
          excludePunctuation: true,
          includeSpace: false,
        },
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );

    integrationPlatform.encryptionString = new Secret(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-n8n-EncryptionString`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${integrationPlatform.name}-n8n-EncryptionString`,
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );

    integrationPlatform.kmsKey = new Key(
      this,
      `${props.stage}-${props.appName}-${integrationPlatform.name}-KMSKey`,
      {
        description: `KMS Key for tenant Integrations`,
        enableKeyRotation: true,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );
  }

  private createPermitSecrets(props: LocalAppProps, permit: PermitConfig) {
    const secret = new Secret(
      this,
      `${props.stage}-${props.appName}-${permit.name}-Secret`,
      {
        secretName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-${permit.name}-Secret`,
        replicaRegions: [
          {
            region: 'eu-west-1',
          },
        ],
      }
    );
    permit.permitSecret = secret;
    this.permitSecretName = secret.secretName;
  }

  private createDataLayerSecurityGroup(props: LocalAppProps) {
    const dataLayerSgName = `${props.stage}-${props.appName}-dataLayerSg`;

    return new SecurityGroup(this, dataLayerSgName, {
      securityGroupName: dataLayerSgName,
      vpc: this.defaultVPC,
    });
  }

  private createVpn(props: LocalAppProps, tenantStackProps: TenantStackProps) {
    const vpnCertificate = new Certificate(
      this,
      `${props.stage}-${props.appName}-vpn-Certificate`,
      {
        domainName: tenantStackProps.cloudfrontHostName,
        validation: CertificateValidation.fromDns(
          tenantStackProps.cloudfrontHostedZone
        ),
      }
    );

    vpnCertificate
      .metricDaysToExpiry()
      .createAlarm(
        this,
        `${props.stage}-${props.appName}-vpn-CertificateExpiryAlarm`,
        {
          evaluationPeriods: 1,
          threshold: 45,
          comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        }
      );

    const selfServiceSamlProvider = new SamlProvider(
      this,
      `${props.stage}-ClientVpnSelfService-idP`,
      {
        name: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-ClientVpnSelfService-idP`,
        metadataDocument: SamlMetadataDocument.fromFile(
          path.join(
            __dirname,
            'samlMetadata',
            `ClientVPN-SelfService-${props.stage}.xml`
          )
        ),
      }
    );

    const samlProvider = new SamlProvider(
      this,
      `${props.stage}-ClientVpn-idP`,
      {
        name: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-ClientVpn-idP`,
        metadataDocument: SamlMetadataDocument.fromFile(
          path.join(__dirname, 'samlMetadata', `ClientVPN-${props.stage}.xml`)
        ),
      }
    );

    const logGroup = new LogGroup(this, `${props.stage}-ClientVpnLogGroup`, {
      logGroupName: `/aws/vpn/${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}`,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const securityGroup = new SecurityGroup(
      this,
      `${props.stage}-ClientVpnSG`,
      {
        vpc: this.defaultVPC,
        allowAllOutbound: true,
        securityGroupName: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-ClientVpn`,
      }
    );

    this.clientVpnSecurityGroup = securityGroup;

    this.tenants.forEach((tenant) => {
      tenant.databaseCluster?.connections.allowFrom(
        securityGroup,
        Port.tcp(5432),
        'Allow VPN access to RDS'
      );
    });

    const endpointProps: ClientVpnEndpointOptions = {
      cidr: '172.31.252.0/22',
      userBasedAuthentication: ClientVpnUserBasedAuthentication.federated(
        samlProvider,
        selfServiceSamlProvider
      ),
      authorizeAllUsersToVpcCidr: false,
      serverCertificateArn: vpnCertificate.certificateArn,
      selfServicePortal: true,
      dnsServers: ['172.31.0.2'],
      logging: true,
      logGroup: logGroup,
      splitTunnel: true,
      securityGroups: [securityGroup],
      vpcSubnets: this.defaultVPC.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    };

    const endpoint = this.defaultVPC.addClientVpnEndpoint(
      `${props.stage}-ClientVpnEndpoint`,
      endpointProps
    );

    endpoint.addAuthorizationRule('AllowAll', {
      cidr: '0.0.0.0/0',
    });
  }
}
