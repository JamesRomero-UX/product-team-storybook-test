import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { EventBus } from 'aws-cdk-lib/aws-events';
import type { LocalAppProps } from 'bin/cdk-stack';
import type { Construct } from 'constructs';

export class EventStack extends Stack {
  commonEventBus: EventBus;
  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps
  ) {
    super(scope, id, stackProps);
    this.commonEventBus = this.createCommonEventBus(props);
  }
  private createCommonEventBus(props: LocalAppProps): EventBus {
    const eventBus = new EventBus(this, `CommonEventBus`, {
      eventBusName: `${props.stage}-${props.appName}-CommonEventBus`,
    });

    return eventBus;
  }
}
