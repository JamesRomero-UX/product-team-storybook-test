import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

import type { DomainsOutputs, DomainStackProps } from './domainsStack';

export class CustomAppDomainStack extends Stack {
  readonly domainsOutputs: DomainsOutputs;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: DomainStackProps
  ) {
    super(scope, id, stackProps);

    const domain = `${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}.${props.publicBaseDomain}`; //TODO

    const hostedZone = new HostedZone(this, `${props.stage}-HostedZone`, {
      zoneName: domain,
    });

    this.domainsOutputs = {
      hostedZoneId: hostedZone.hostedZoneId,
      hostedZoneName: hostedZone.zoneName,
      hostname: domain,
    };
  }
}
