import type { aws_ec2, StackProps } from 'aws-cdk-lib';
import {
  aws_events,
  aws_events_targets,
  aws_sqs,
  Duration,
  Stack,
} from 'aws-cdk-lib';
import type { LocalAppProps } from 'bin/cdk-stack';
import type { Construct } from 'constructs';
import * as path from 'path';

import { RisksmartFunction } from './constructs/risksmartFunction';

export interface GlobalTenantConfigFunctionsStackProps extends LocalAppProps {
  sharedEventBus: aws_events.EventBus;
  sentryRelease: string;
  localTenantConfigTable: string;
  localDynamodbEndpoint: string;
  defaultVPC?: aws_ec2.IVpc;
}

/** This stack should not exist and the functions within it should be in the global tenant config stack.
 * The reason it's here is because by passing the VPC into the global tenant config stack we create a circular dependency.
 * The VPC will be removed from this stack in the future.
 *
 * Once the VPC is removed from this stack this function should be moved to the global tenant config stack.
 * I dont feel good about this either.
 */
export class GlobalTenantConfigFunctionsStack extends Stack {
  private readonly relativeHandlerDirectoryPath =
    '../../services/tenant-configuration/src/handlers' as const;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: GlobalTenantConfigFunctionsStackProps
  ) {
    super(scope, id, stackProps);
    this.createEventPropagationFunction(props);
  }

  private readonly createEventPropagationFunction = (
    props: GlobalTenantConfigFunctionsStackProps
  ) => {
    const isLocal = (stage: string) =>
      !['dev-cloud', 'staging', 'prod'].includes(stage);

    const fn = new RisksmartFunction(this, 'TenantEventPropagationHandler', {
      ...props,
      vpc: props.defaultVPC,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'propagate-event/index.ts'
      ),
      functionName: 'tenant-event-propagation',
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        EVENT_BUS_NAME: props.sharedEventBus.eventBusName,
        TENANT_CONFIG_TABLE: isLocal(props.stage)
          ? props.localTenantConfigTable
          : `${props.stage}-risksmartApp-GlobalTenantConfig`,
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? props.localDynamodbEndpoint
          : '',
      },
    });

    const eventRule = new aws_events.Rule(this, 'TenantEventPropagationRule', {
      eventBus: props.sharedEventBus,
      ruleName: 'tenant-event-propagation-rule',
      description: 'Propagate broadcast events to regional tenants',
      eventPattern: {
        detail: {
          metadata: {
            $or: [{ tenant: [{ exists: false }] }, { tenant: [''] }],
          },
        },
      },
    });

    const deadLetterQueue = new aws_sqs.Queue(
      this,
      'TenantEventPropagationDlq',
      {
        queueName: `${this.region}-${props.stage}-tenant-event-propagation-dlq`,
        retentionPeriod: Duration.days(14),
      }
    );

    eventRule.addTarget(
      new aws_events_targets.LambdaFunction(fn.lambda, {
        deadLetterQueue,
      })
    );
  };
}
