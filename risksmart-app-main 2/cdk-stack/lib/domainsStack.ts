import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { ZoneDelegationRecord } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export interface DomainsOutputs {
  hostedZoneId: string;
  hostedZoneName: string;
  hostname: string;
}

export interface DomainStackProps extends LocalAppProps {
  prefixKey: string;
}

//AWS Account based DNS
export class DomainStack extends Stack {
  readonly domainsOutputs: DomainsOutputs;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: DomainStackProps
  ) {
    super(scope, id, stackProps);

    if (!props.baseDomain) {
      throw new Error('baseDomain required');
    }

    const domain = `${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}-${props.appName}-${props.prefixKey}.${props.baseDomain}`;

    const hostedZone = new HostedZone(
      this,
      `${props.stage}-${props.appName}-HostedZone`,
      {
        zoneName: domain,
      }
    );

    const nameServers: string[] = hostedZone.hostedZoneNameServers!;
    const rootZone = HostedZone.fromLookup(this, 'Zone', {
      domainName: props.baseDomain,
    });
    new ZoneDelegationRecord(
      this,
      `${props.stage}-${props.appName}-ZoneDelegationRecord`,
      {
        recordName: domain,
        nameServers,
        zone: rootZone,
      }
    );

    this.domainsOutputs = {
      hostedZoneId: hostedZone.hostedZoneId,
      hostedZoneName: hostedZone.zoneName,
      hostname: domain,
    };
  }
}
