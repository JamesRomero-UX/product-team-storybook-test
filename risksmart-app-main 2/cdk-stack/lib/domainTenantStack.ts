import type { StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { HostedZone, ZoneDelegationRecord } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export class DomainTenantStack extends cdk.Stack {
  Hostname: string;
  HostedZone: HostedZone;

  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps?: StackProps
  ) {
    super(scope, id, stackProps);

    if (!props.baseDomain) {
      throw new Error('baseDomain required');
    }

    this.Hostname = `${props.riskSmartRegionProps.regionDomainPrefix}${props.stage}-${props.appName}-api-tenant.${props.baseDomain}`;
    this.HostedZone = new HostedZone(
      this,
      `${props.stage}-${props.appName}-tenant-HostedZone`,
      {
        zoneName: this.Hostname,
      }
    );

    const nameServers: string[] = this.HostedZone.hostedZoneNameServers!;
    const rootZone = HostedZone.fromLookup(
      this,
      `${props.stage}-${props.appName}-cd-tenant-Zone`,
      {
        domainName: props.baseDomain,
      }
    );
    new ZoneDelegationRecord(
      this,
      `${props.stage}-${props.appName}-api-tenant-ZoneDelegationRecord`,
      {
        recordName: this.Hostname,
        nameServers,
        zone: rootZone,
      }
    );
  }
}
